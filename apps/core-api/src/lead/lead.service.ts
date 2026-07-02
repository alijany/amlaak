import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CreateLeadDto } from './dtos/create-lead.dto';
import { LeadFilterDto } from './dtos/lead-filter.dto';
import { UpdateLeadDto } from './dtos/update-lead.dto';
import { LeadEntity } from './lead.entity';

@Injectable()
export class LeadService extends BaseRepositoryService<LeadEntity> {
  constructor(
    @InjectRepository(LeadEntity)
    protected repository: EntityRepository<LeadEntity>,
  ) {
    super(repository);
  }

  async createLead(dto: CreateLeadDto): Promise<LeadEntity> {
    const lead = this.repository.create({
      name: dto.name,
      phone: dto.phone,
      businessName: dto.businessName,
      businessType: dto.businessType,
      service: dto.service,
      businessSize: dto.businessSize,
      message: dto.message,
    });

    await this.persistAndFlush(lead);
    return lead;
  }

  async findLeads(filters: LeadFilterDto) {
    const { page = 0, limit = 10, status } = filters;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.findAll(where, {
      orderBy: { created_at: 'DESC' },
      limit,
      offset: page * limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async updateLead(id: number, dto: UpdateLeadDto): Promise<LeadEntity> {
    const lead = await this.findOne({ id });
    if (!lead) throw new NotFoundException('سرنخ یافت نشد');
    if (dto.status !== undefined) lead.status = dto.status;
    await this.persistAndFlush(lead);
    return lead;
  }
}
