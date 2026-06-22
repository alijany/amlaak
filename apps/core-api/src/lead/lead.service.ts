import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { Role } from 'src/roles/roles.constants';
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
const MANAGER_ROLES = [Role.MANAGER, Role.OWNER, Role.ADMIN];

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

  /** Managers/admins see every lead; agents see their own + claimable ones. */
  private isManager(viewer: UserEntity): boolean {
    return viewer.roles.exists((r) => MANAGER_ROLES.includes(r.role));
  }

  private scopeFilter(viewer: UserEntity): FilterQuery<LeadEntity> {
    if (this.isManager(viewer)) return {};
    return { $or: [{ assignedAgent: viewer.id }, { assignedAgent: null }] };
  }

  async createManual(dto: CreateLeadDto): Promise<LeadEntity> {
    const ad = await this.advertisements.findOne({ id: dto.advertisementId });
    if (!ad) throw new NotFoundException('listing not found');

    const lead = this.repository.create({
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

    if (dto.assignedAgentId)
      await this.notifyAssigned(lead, dto.assignedAgentId);
    return lead;
  }

  async search(filter: LeadFilterDto, viewer: UserEntity) {
    const { page = 0, limit = 20 } = filter;

    const and: FilterQuery<LeadEntity>[] = [this.scopeFilter(viewer)];
    if (filter.status) and.push({ status: filter.status });
    if (filter.source) and.push({ source: filter.source });
    if (filter.poolId) and.push({ pool: filter.poolId });
    if (filter.assignedAgentId)
      and.push({ assignedAgent: filter.assignedAgentId });
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

  async findOneScoped(id: number, viewer: UserEntity): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');

    if (!this.isManager(viewer)) {
      const ownerId = lead.assignedAgent?.id;
      if (ownerId && ownerId !== viewer.id) {
        throw new ForbiddenException('not your lead');
      }
    }
    return lead;
  }

  async update(id: number, dto: UpdateLeadDto, viewer: UserEntity) {
    const lead = await this.findOneScoped(id, viewer);

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
  async assign(id: number, agentId: number): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');

    this.em.assign(lead, { assignedAgent: agentId });
    await this.persistAndFlush(lead);
    await this.notifyAssigned(lead, agentId);
    return lead;
  }

  /** Agent action: claim a lead (must be unassigned or already theirs). */
  async claim(id: number, viewer: UserEntity): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');

    const ownerId = lead.assignedAgent?.id;
    if (ownerId && ownerId !== viewer.id) {
      throw new ForbiddenException('lead already assigned');
    }

    this.em.assign(lead, { assignedAgent: viewer.id });
    await this.persistAndFlush(lead);
    return lead;
  }

  /** Status funnel for the dashboard, scoped to the viewer. */
  async stats(viewer: UserEntity) {
    const base = this.scopeFilter(viewer);
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
    const mine = await this.count({ assignedAgent: viewer.id });

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
