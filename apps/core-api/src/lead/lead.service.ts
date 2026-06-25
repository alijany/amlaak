import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgencyContext } from 'src/agency/agency-access.service';
import { AgencyEntity } from 'src/agency/agency.entity';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { AdvertisementService } from '../real-estate/advertisement.service';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { LeadFilterDto } from './dtos/lead.filter.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { LeadPoolEntity } from './lead-pool.entity';
import { LeadStatus } from './lead.constants';
import { LeadEntity } from './lead.entity';
import { advertisementTrackingCode } from './lead.tracking';

const POPULATE = ['advertisement', 'pool', 'pool.agencies', 'agency'] as never;

@Injectable()
export class LeadService extends BaseRepositoryService<LeadEntity> {
  constructor(
    @InjectRepository(LeadEntity)
    protected repository: EntityRepository<LeadEntity>,
    private readonly advertisements: AdvertisementService,
  ) {
    super(repository);
  }

  private canSeeAllLeads(ctx: AgencyContext): boolean {
    return ctx.activeAgencyId == null && ctx.isPlatformAdmin;
  }

  /**
   * Visibility filter: every member of an agency sees
   *   - leads owned by their agency, OR
   *   - unclaimed leads in a shared pool where their agency is a member.
   */
  private scopeFilter(ctx: AgencyContext): FilterQuery<LeadEntity> {
    if (this.canSeeAllLeads(ctx)) return {};

    const agencyId = ctx.activeAgencyId;
    if (!agencyId) return { id: -1 };

    return {
      $or: [
        // Leads owned by this agency (any member can see/handle them)
        { agency: agencyId },
        // Unclaimed leads in a shared pool this agency belongs to
        { agency: null, pool: { agencies: { agency: agencyId } } },
      ],
    };
  }

  /** Verify the active agency may access the lead (owns it, or is a pool member). */
  private assertCanAccess(lead: LeadEntity, ctx: AgencyContext) {
    if (ctx.isPlatformAdmin) return;
    if (ctx.activeAgencyId == null)
      throw new ForbiddenException('no active agency');
    // Owned by this agency → ok.
    if (lead.agency?.id === ctx.activeAgencyId) return;
    // Unclaimed pool lead where this agency is a member → ok.
    if (lead.agency == null && this.isPoolMember(lead, ctx.activeAgencyId))
      return;
    throw new ForbiddenException('lead belongs to another agency');
  }

  private isPoolMember(lead: LeadEntity, agencyId: number): boolean {
    return !!lead.pool?.agencies
      .getItems()
      .some((m) => m.agency?.id === agencyId);
  }

  async createManual(
    dto: CreateLeadDto,
    ctx: AgencyContext,
  ): Promise<LeadEntity> {
    const ad = await this.advertisements.findOne(
      { id: dto.advertisementId },
      { populate: ['agency'] as never },
    );
    if (!ad) throw new NotFoundException('listing not found');

    // A crawled/platform-owned ad is freely shareable (any agency or pool).
    // An agency-owned ad must stay with its owner: it may only be assigned to
    // that agency, never to another agency and never to a shared pool (which
    // would leak it to other agencies).
    const ownerAgencyId = ad.agency?.id ?? null;
    const isShareable = !ad.agency || ad.agency.isPlatform === true;

    // A lead targets exactly one of: a single agency, or a shared pool.
    let agencyId: number | null;
    let poolId: number | null;

    if (ctx.activeAgencyId != null) {
      // Acting as an agency → the lead is locked to that agency; pool /
      // cross-agency assignment is not allowed from this context.
      agencyId = ctx.activeAgencyId;
      poolId = null;
    } else if (!isShareable) {
      // Platform admin assigning an agency-owned ad: forced to the owner.
      if (
        (dto.agencyId != null && dto.agencyId !== ownerAgencyId) ||
        dto.poolId != null
      ) {
        throw new BadRequestException(
          'این آگهی متعلق به یک آژانس است و فقط می‌تواند به همان آژانس واگذار شود',
        );
      }
      agencyId = ownerAgencyId;
      poolId = null;
    } else {
      // Platform admin with a shareable ad: choose exactly one of agency or pool.
      agencyId = dto.agencyId ?? null;
      poolId = dto.poolId ?? null;
      if (Number(!!poolId) + Number(!!agencyId) !== 1) {
        throw new BadRequestException(
          'یک لید باید دقیقاً به یک آژانس یا یک صف واگذار شود',
        );
      }
    }

    const lead = this.repository.create({
      agency: agencyId
        ? this.em.getReference(AgencyEntity, agencyId)
        : undefined,
      advertisement: ad,
      source: dto.source,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      note: dto.note,
      trackingCode: dto.trackingCode ?? advertisementTrackingCode(ad.id),
      status: LeadStatus.NEW,
      pool: poolId ? this.em.getReference(LeadPoolEntity, poolId) : undefined,
    });
    await this.persistAndFlush(lead);
    return lead;
  }

  async search(filter: LeadFilterDto, ctx: AgencyContext) {
    const { page = 0, limit = 20 } = filter;

    const and: FilterQuery<LeadEntity>[] = [this.scopeFilter(ctx)];
    if (filter.status) and.push({ status: filter.status });
    if (filter.source) and.push({ source: filter.source });
    if (filter.poolId) and.push({ pool: filter.poolId });
    if (filter.agencyId) and.push({ agency: filter.agencyId });
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

    this.assertCanAccess(lead, ctx);
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

  /**
   * Agency action: claim an unclaimed lead out of a shared pool. The first
   * member agency to claim it takes ownership — the lead leaves the pool and is
   * assigned to the claiming agency.
   */
  async claim(id: number, ctx: AgencyContext): Promise<LeadEntity> {
    const lead = await this.findOne({ id }, { populate: POPULATE });
    if (!lead) throw new NotFoundException('lead not found');

    if (ctx.activeAgencyId == null)
      throw new ForbiddenException('no active agency');
    if (lead.agency != null)
      throw new ForbiddenException('این لید قبلاً واگذار شده است');
    if (lead.pool == null)
      throw new BadRequestException('این لید در هیچ صفی نیست');
    if (!this.isPoolMember(lead, ctx.activeAgencyId))
      throw new ForbiddenException('lead belongs to another pool');

    // Transfer ownership to the claiming agency and clear the pool.
    this.em.assign(lead, {
      agency: this.em.getReference(AgencyEntity, ctx.activeAgencyId),
      pool: undefined,
    });
    await this.persistAndFlush(lead);
    return lead;
  }

  /** Status funnel for the dashboard, scoped to what the active agency can see. */
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

    return { total, byStatus };
  }
}
