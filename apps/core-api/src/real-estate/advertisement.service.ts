import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CrawlJobEntity } from '../crawler/jobs/crawl-job.entity';
import { CrawlTargetEntity } from '../crawler/targets/crawl-target.entity';
import { RealEstateAdvertisementEntity } from './advertisement.entity';
import { AdvertisementFilterDto } from './dtos/advertisement.filter.dto';
import { PublicListingFilterDto } from './dtos/public-listing.filter.dto';
import { NormalizedAdvertisement } from './normalization.service';
import { PublishStatus } from './real-estate.constants';

export interface UpsertResult {
  created: boolean;
}

/** Per-listing tracking code (mirror of lead/lead.tracking.ts + frontend util). */
function trackingCode(id: number): string {
  return `NV-${id.toString(36).toUpperCase()}`;
}

/** Attribute keys safe to expose publicly (source contact info is dropped). */
const PUBLIC_ATTRIBUTE_KEYS = [
  'amenities',
  'propertySubtype',
  'documentType',
  'buildingAge',
  'landArea',
  'cabinetCondition',
  'floorCondition',
  'facadeCondition',
];

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
    if (rest.publishStatus) where.publishStatus = rest.publishStatus;
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

  /** Public catalog: PUBLISHED listings only, trimmed to a safe public shape. */
  async searchPublic(filters: PublicListingFilterDto) {
    const { page = 0, limit = 12, q, ...rest } = filters;
    const where: FilterQuery<RealEstateAdvertisementEntity> = {
      publishStatus: PublishStatus.PUBLISHED,
    };

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
      orderBy: { publishedAt: 'DESC', id: 'DESC' },
      limit,
      offset: page * limit,
    });

    return {
      items: items.map((ad) => this.toPublic(ad)),
      meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
    };
  }

  /** A single PUBLISHED listing in public shape, or null. */
  async findOnePublic(id: number) {
    const ad = await this.findOne({
      id,
      publishStatus: PublishStatus.PUBLISHED,
    });
    return ad ? this.toPublic(ad) : null;
  }

  async setPublishStatus(
    ad: RealEstateAdvertisementEntity,
    status: PublishStatus,
  ): Promise<void> {
    ad.publishStatus = status;
    if (status === PublishStatus.PUBLISHED && !ad.publishedAt) {
      ad.publishedAt = new Date();
    }
    await this.persistAndFlush(ad);
  }

  /** Strip internal/source fields; expose only what a public visitor should see. */
  toPublic(ad: RealEstateAdvertisementEntity) {
    const attributes: Record<string, any> = {};
    for (const key of PUBLIC_ATTRIBUTE_KEYS) {
      if (ad.attributes?.[key] !== undefined) {
        attributes[key] = ad.attributes[key];
      }
    }

    return {
      id: ad.id,
      trackingCode: trackingCode(ad.id),
      title: ad.title,
      description: ad.description,
      category: ad.category,
      totalPrice: ad.totalPrice,
      deposit: ad.deposit,
      rent: ad.rent,
      pricePerMeter: ad.pricePerMeter,
      area: ad.area,
      rooms: ad.rooms,
      yearBuilt: ad.yearBuilt,
      floor: ad.floor,
      province: ad.province,
      city: ad.city,
      district: ad.district,
      images: ad.images,
      attributes,
      publishedAt: ad.publishedAt,
    };
  }
}
