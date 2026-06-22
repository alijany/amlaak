import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable } from '@nestjs/common';
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

  async list() {
    const [items] = await this.findAll({}, { orderBy: { name: 'ASC' } });
    return { items };
  }

  async createPool(dto: CreateLeadPoolDto) {
    return this.create({ name: dto.name, description: dto.description });
  }

  async updatePool(id: number, dto: UpdateLeadPoolDto) {
    return this.updateOne({ id }, dto);
  }
}
