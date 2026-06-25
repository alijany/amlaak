import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
  types,
  Unique,
} from '@mikro-orm/core';
import { AgencyEntity } from '../agency/agency.entity';
import { CityEntity } from '../city/city.entity';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { CrawlJobEntity } from '../crawler/jobs/crawl-job.entity';
import { CrawlTargetEntity } from '../crawler/targets/crawl-target.entity';
import { UserEntity } from '../user/user.entity';
import {
  AdvertisementSource,
  PublishStatus,
  RealEstateCategory,
} from './real-estate.constants';

/**
 * A normalized real-estate advertisement. Either aggregated from a target by the
 * crawler (source=CRAWLER, keyed by (target, externalId)) or created in-app by a
 * user/agency (source=USER, no target). `attributes`/`rawPayload` keep anything
 * untyped so the schema can evolve without losing data.
 */
@Entity()
@Unique({ properties: ['target', 'externalId'] })
export class RealEstateAdvertisementEntity extends BaseEntity {
  /** Crawl target. Null for user-created (marketplace) listings. */
  @ManyToOne(() => CrawlTargetEntity, { nullable: true })
  target?: CrawlTargetEntity;

  @Enum({
    items: () => AdvertisementSource,
    default: AdvertisementSource.CRAWLER,
  })
  @Index()
  source: AdvertisementSource = AdvertisementSource.CRAWLER;

  /** Owning agency (tenant). Crawled listings belong to the platform agency. */
  @ManyToOne(() => AgencyEntity, { nullable: true })
  @Index()
  agency?: AgencyEntity;

  /** The user who created an in-app listing. */
  @ManyToOne(() => UserEntity, { nullable: true })
  createdBy?: UserEntity;

  /** Job that most recently produced/updated this record. */
  @ManyToOne(() => CrawlJobEntity, { nullable: true })
  job?: CrawlJobEntity;

  /** Source-side identifier (slug/token) — unique within a target. Null for user listings. */
  @Property({ nullable: true })
  externalId?: string;

  /** Divar URLs are percent-encoded Persian and can exceed varchar(255). */
  @Property({ type: 'text', nullable: true })
  sourceUrl?: string;

  @Property({ nullable: true })
  @Index()
  title?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Enum({
    items: () => RealEstateCategory,
    default: RealEstateCategory.UNKNOWN,
  })
  category: RealEstateCategory = RealEstateCategory.UNKNOWN;

  // --- normalized numeric fields (null when not applicable) ---
  @Property({ type: 'bigint', nullable: true })
  totalPrice?: number;

  @Property({ type: 'bigint', nullable: true })
  deposit?: number;

  @Property({ type: 'bigint', nullable: true })
  rent?: number;

  @Property({ type: 'bigint', nullable: true })
  pricePerMeter?: number;

  @Property({ nullable: true })
  area?: number;

  @Property({ nullable: true })
  rooms?: number;

  @Property({ nullable: true })
  yearBuilt?: number;

  @Property({ nullable: true })
  floor?: number;

  // --- location ---
  @Property({ nullable: true })
  province?: string;

  @ManyToOne(() => CityEntity, { nullable: true })
  @Index()
  city?: CityEntity;

  @Property({ nullable: true })
  district?: string;

  @Property({ type: 'double', nullable: true })
  lat?: number;

  @Property({ type: 'double', nullable: true })
  lng?: number;

  // --- extras ---
  @Property({ type: 'json', nullable: true })
  images?: string[];

  @Property({ type: 'json', nullable: true })
  attributes?: Record<string, any>;

  /** Untouched provider payload for re-processing/debugging. */
  @Property({ type: 'json', nullable: true })
  rawPayload?: Record<string, any>;

  @Property({ type: 'timestamp', nullable: true })
  postedAt?: Date;

  @Property({ type: 'timestamp', nullable: true })
  crawledAt?: Date;

  // --- moderation / distribution (M2) ---
  /** Listings start PENDING; a manager approves to publish + post to Telegram. */
  @Enum({ items: () => PublishStatus, default: PublishStatus.PENDING })
  @Index()
  publishStatus: PublishStatus = PublishStatus.PENDING;

  @Property({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Property({ type: 'timestamp', nullable: true })
  telegramPostedAt?: Date;

  @Property({ type: types.bigint, nullable: true })
  telegramMessageId?: number;
}
