import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgencyContext } from 'src/agency/agency-access.service';
import { AgencyEntity } from 'src/agency/agency.entity';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { UserEntity } from 'src/user/user.entity';
import { NotificationTemplate } from '../notification/notification.constants';
import { NotificationService } from '../notification/services/notification.service';
import { AdvertisementService } from '../real-estate/advertisement.service';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { LeadFilterDto } from './dtos/lead.filter.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { LeadPoolEntity } from './lead-pool.entity';
import { LeadStatus } from './lead.constants';
import { LeadEntity } from './lead.entity';
import { advertisementTrackingCode } from './lead.tracking';

const POPULATE = ['advertisement', 'assignedAgent', 'pool'] as never;

@Injectable()
export class LeadService extends BaseRepositoryService<LeadEntity> {
  constructor(
    @InjectRepository(LeadEntity)
    protected repository: EntityRepository<LeadEntity>,
    private readonly advertisements: AdvertisementService,
    private readonly notifications: NotificationService,
  ) {
    super(repository);
  }

  /** Restrict to the active agency (platform admin = cross-tenant). */
  private agencyFilter(ctx: AgencyContext): FilterQuery<LeadEntity> {
    if (ctx.activeAgencyId != null) return { agency: ctx.activeAgencyId };
    if (ctx.isPlatformAdmin) return {};
    return { id: -1 }; // no agency context, not admin → see nothing
  }

  /**
   * Agency scope + (for non-managers) only their own leads OR unassigned leads
   * that are in a pool (claimable). Unassigned leads with no pool are invisible
   * to non-managers — they belong to no one and cannot be claimed from a queue.
   */
  private scopeFilter(ctx: AgencyContext): FilterQuery<LeadEntity> {
    const and: FilterQuery<LeadEntity>[] = [this.agencyFilter(ctx)];
    if (!ctx.isManager) {
      and.push({
        $or: [
          { assignedAgent: ctx.viewerId },
          { assignedAgent: null, pool: { $ne: null } },
        ],
      });
    }
    return { $and: and };
  }

  private assertSameAgency(lead: LeadEntity, ctx: AgencyContext) {
    if (ctx.isPlatformAdmin) return;
    if (ctx.activeAgencyId != null && lead.agency?.id !== ctx.activeAgencyId) {
      throw new ForbiddenException('lead belongs to another agency');
    }
  }

  async createManual(
    dto: CreateLeadDto,
    ctx: AgencyContext,
  ): Promise<LeadEntity> {
    const ad = await this.advertisements.findOne({ id: dto.advertisementId });
    if (!ad) throw new NotFoundException('listing not found');

    const lead = this.repository.create({
      agency: ctx.activeAgencyId
        ? this.em.getReference(AgencyEntity, ctx.activeAgencyId)
        : undefined,
      advertisement: ad,
      source: dto.source,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      note: dto.note,
      trackingCode: dto.trackingCode ?? advertisementTrackingCode(ad.id),
      status: LeadStatus.NEW,
      pool: dto.poolId
        ? this.em.getReference(LeadPoolEntity, dto.poolId)
        : undefined,
      assignedAgent: dto.assignedAgentId
        ? this.em.getReference(UserEntity, dto.assignedAgentId)
        : undefined,
    });
    await this.persistAndFlush(lead);

    // Don't notify when a user assigns the lead to themselves.
    if (dto.assignedAgentId && dto.assignedAgentId !== ctx.viewerId)
      await this.notifyAssigned(lead, dto.assignedAgentId);
    return lead;
  }

  async search(filter: LeadFilterDto, ctx: AgencyContext) {
    const { page = 0, limit = 20 } = filter;

    const and: FilterQuery<LeadEntity>[] = [this.scopeFilter(ctx)];
    if (filter.status) and.push({ status: filter.status });
    if (filter.source) and.push({ source: filter.source });
    if (filter.poolId) and.push({ pool: filter.poolId });
    if (filter.assignedAgentId)
      and.push({ assignedAgent: filter.assignedAgentId });
    if (filter.advertisementId)
      and.push({ advertisement: filter.advertisementId });
    if (filter.q) {
      const like = `%${filter.q}%`;
      and.push({
        $or: [
          { contactName: { $ilike: like } },
          { contactPhone: { $ilike: like } },
          { trackingCode: { $ilike: like } },
          { advertisement: { title: { $ilike: like } } },
        ],
      });
    }

    const [items, total] = await this.findAll(
      { $and: and },
      {
        orderBy: { created_at: 'DESC', id: 'DESC' },
        limit,
        offset: page * limit,
        populate: POPULATE,
      },
    );

    return {
      items,
      meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
    };
  }

  async findOneScoped(id: number, ctx: AgencyContext): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');

    this.assertSameAgency(lead, ctx);
    if (!ctx.isManager) {
      const ownerId = lead.assignedAgent?.id;
      if (ownerId && ownerId !== ctx.viewerId) {
        throw new ForbiddenException('not your lead');
      }
    }
    return lead;
  }

  async update(id: number, dto: UpdateLeadDto, ctx: AgencyContext) {
    const lead = await this.findOneScoped(id, ctx);

    if (dto.status) {
      lead.status = dto.status;
      if (dto.status === LeadStatus.CONTACTED && !lead.lastContactedAt) {
        lead.lastContactedAt = new Date();
      }
      if (dto.status === LeadStatus.WON || dto.status === LeadStatus.LOST) {
        lead.closedAt = new Date();
      }
    }
    if (dto.source !== undefined) lead.source = dto.source;
    if (dto.contactName !== undefined) lead.contactName = dto.contactName;
    if (dto.contactPhone !== undefined) lead.contactPhone = dto.contactPhone;
    if (dto.note !== undefined) lead.note = dto.note;
    if (dto.poolId !== undefined) {
      lead.pool = dto.poolId
        ? this.em.getReference(LeadPoolEntity, dto.poolId)
        : undefined;
    }

    await this.persistAndFlush(lead);
    return lead;
  }

  /** Manager action: assign a lead to an agent. */
  async assign(
    id: number,
    agentId: number,
    ctx: AgencyContext,
  ): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');
    this.assertSameAgency(lead, ctx);

    this.em.assign(lead, { assignedAgent: agentId });
    await this.persistAndFlush(lead);
    if (agentId !== ctx.viewerId) await this.notifyAssigned(lead, agentId);
    return lead;
  }

  /** Agent action: claim a lead (must be unassigned or already theirs). */
  async claim(id: number, ctx: AgencyContext): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');
    this.assertSameAgency(lead, ctx);

    const ownerId = lead.assignedAgent?.id;
    if (ownerId && ownerId !== ctx.viewerId) {
      throw new ForbiddenException('lead already assigned');
    }

    this.em.assign(lead, { assignedAgent: ctx.viewerId });
    await this.persistAndFlush(lead);
    return lead;
  }

  /** Status funnel for the dashboard, scoped to the active agency + viewer. */
  async stats(ctx: AgencyContext) {
    const base = this.scopeFilter(ctx);
    const statuses = Object.values(LeadStatus);

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.count({ $and: [base, { status }] }),
      })),
    );

    const byStatus = counts.reduce<Record<string, number>>(
      (acc, { status, count }) => ({ ...acc, [status]: count }),
      {},
    );
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const mine = await this.count({
      $and: [this.agencyFilter(ctx), { assignedAgent: ctx.viewerId }],
    });

    return { total, mine, byStatus };
  }

  private async notifyAssigned(lead: LeadEntity, agentId: number) {
    const title = lead.advertisement?.title ?? `#${lead.advertisement?.id}`;
    await this.notifications.sendToUser(
      agentId,
      `یک سرنخ جدید برای «${title}» به شما اختصاص یافت.`,
      {
        priority: 'high',
        metadata: {
          template: NotificationTemplate.LEAD_ASSIGNED,
          leadId: lead.id,
          advertisementId: lead.advertisement?.id,
        },
      },
    );
  }
}
