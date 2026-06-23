import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable } from '@nestjs/common';
import { AgencyContext } from 'src/agency/agency-access.service';
import { AgencyEntity } from 'src/agency/agency.entity';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CreateLeadPoolDto, UpdateLeadPoolDto } from './dtos/lead-pool.dto';
import { LeadPoolEntity } from './lead-pool.entity';

@Injectable()
export class LeadPoolService extends BaseRepositoryService<LeadPoolEntity> {
  constructor(
    @InjectRepository(LeadPoolEntity)
    protected repository: EntityRepository<LeadPoolEntity>,
  ) {
    super(repository);
  }

  async list(ctx: AgencyContext) {
    const where: FilterQuery<LeadPoolEntity> =
      ctx.activeAgencyId != null
        ? { agency: ctx.activeAgencyId }
        : ctx.isPlatformAdmin
        ? {}
        : { id: -1 };
    const [items] = await this.findAll(where, { orderBy: { name: 'ASC' } });
    return { items };
  }

  async createPool(dto: CreateLeadPoolDto, ctx: AgencyContext) {
    return this.create({
      name: dto.name,
      description: dto.description,
      agency: ctx.activeAgencyId
        ? this.em.getReference(AgencyEntity, ctx.activeAgencyId)
        : undefined,
    });
  }

  async updatePool(id: number, dto: UpdateLeadPoolDto) {
    return this.updateOne({ id }, dto);
  }
}
