import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable } from '@nestjs/common';
import { AgencyContext } from 'src/agency/agency-access.service';
import { AgencyEntity } from 'src/agency/agency.entity';

import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CreateLeadPoolDto, UpdateLeadPoolDto } from './dtos/lead-pool.dto';
import { LeadPoolAgencyEntity } from './lead-pool-agency.entity';
import { LeadPoolEntity } from './lead-pool.entity';

@Injectable()
export class LeadPoolService extends BaseRepositoryService<LeadPoolEntity> {
  constructor(
    @InjectRepository(LeadPoolEntity)
    protected repository: EntityRepository<LeadPoolEntity>,
    @InjectRepository(LeadPoolAgencyEntity)
    private readonly poolAgencyRepo: EntityRepository<LeadPoolAgencyEntity>,
  ) {
    super(repository);
  }

  async list(ctx: AgencyContext) {
    const where: FilterQuery<LeadPoolEntity> =
      ctx.isPlatformAdmin && ctx.activeAgencyId == null
        ? {} // platform admin sees all pools
        : ctx.activeAgencyId != null
        ? { agencies: { agency: ctx.activeAgencyId } } // member pools only
        : { id: -1 };

    const [items] = await this.findAll(where, {
      orderBy: { name: 'ASC' },
      populate: ['agencies.agency'] as never,
    });
    return { items };
  }

  async createPool(dto: CreateLeadPoolDto) {
    const pool = await this.create({
      name: dto.name,
      description: dto.description,
    });

    for (const agencyId of dto.agencyIds) {
      const junction = this.poolAgencyRepo.create({
        pool,
        agency: this.em.getReference(AgencyEntity, agencyId),
      });
      this.em.persist(junction);
    }
    await this.em.flush();

    return pool;
  }

  async updatePool(id: number, dto: UpdateLeadPoolDto) {
    const update: Record<string, any> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    const pool = await this.updateOne({ id }, update);

    if (dto.agencyIds !== undefined) {
      await this.poolAgencyRepo.nativeDelete({ pool: id });
      for (const agencyId of dto.agencyIds) {
        const junction = this.poolAgencyRepo.create({
          pool,
          agency: this.em.getReference(AgencyEntity, agencyId),
        });
        this.em.persist(junction);
      }
      await this.em.flush();
    }

    return pool;
  }
}
