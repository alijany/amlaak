import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CrawlJobEntity } from '../crawler/jobs/crawl-job.entity';
import { CrawlTargetEntity } from '../crawler/targets/crawl-target.entity';
import { RealEstateAdvertisementEntity } from './advertisement.entity';
import { AdvertisementFilterDto } from './dtos/advertisement.filter.dto';
import { NormalizedAdvertisement } from './normalization.service';

export interface UpsertResult {
  created: boolean;
}

@Injectable()
export class AdvertisementService extends BaseRepositoryService<RealEstateAdvertisementEntity> {
  constructor(
    @InjectRepository(RealEstateAdvertisementEntity)
    protected repository: EntityRepository<RealEstateAdvertisementEntity>,
  ) {
    super(repository);
  }

  /**
   * Insert or update an ad keyed by (target, externalId). Returns whether a new
   * row was created so callers can keep accurate job stats.
   */
  async upsert(
    target: CrawlTargetEntity,
    job: CrawlJobEntity,
    data: NormalizedAdvertisement,
  ): Promise<UpsertResult> {
    const existing = await this.findOne({
      target: target.id,
      externalId: data.externalId,
    });

    if (existing) {
      this.em.assign(existing, { ...data, target, job });
      await this.persistAndFlush(existing);
      return { created: false };
    }

    const entity = this.repository.create({ ...data, target, job });
    await this.persistAndFlush(entity);
    return { created: true };
  }

  /** Paginated, filterable list for the dashboard data view. */
  async search(filters: AdvertisementFilterDto) {
    const { page = 0, limit = 12, q, ...rest } = filters;
    const where: FilterQuery<RealEstateAdvertisementEntity> = {};

    if (rest.targetId) where.target = rest.targetId;
    if (rest.category) where.category = rest.category;
    if (rest.city) where.city = rest.city;
    if (rest.district) where.district = rest.district;
    if (rest.rooms != null) where.rooms = rest.rooms;
    if (rest.minPrice != null || rest.maxPrice != null) {
      where.totalPrice = {
        ...(rest.minPrice != null ? { $gte: rest.minPrice } : {}),
        ...(rest.maxPrice != null ? { $lte: rest.maxPrice } : {}),
      };
    }
    if (q) {
      where.$or = [
        { title: { $ilike: `%${q}%` } },
        { description: { $ilike: `%${q}%` } },
      ];
    }

    const [items, total] = await this.findAll(where, {
      orderBy: { crawledAt: 'DESC', id: 'DESC' },
      limit,
      offset: page * limit,
      populate: ['target'] as never,
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
}
