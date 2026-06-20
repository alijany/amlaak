import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { RealEstateCategory } from '../crawler.constants';
import { CrawlJobEntity } from '../jobs/crawl-job.entity';
import { CrawlTargetEntity } from '../targets/crawl-target.entity';

/**
 * A normalized real-estate advertisement collected from a target.
 *
 * Real-estate-specific by design (per phase decision). The natural key is
 * (target, externalId), enforced unique so re-crawls upsert. `attributes` and
 * `rawPayload` keep anything that doesn't map to a typed column, so the schema
 * can evolve without losing source data.
 */
@Entity()
@Unique({ properties: ['target', 'externalId'] })
export class RealEstateAdvertisementEntity extends BaseEntity {
  @ManyToOne(() => CrawlTargetEntity)
  target: CrawlTargetEntity;

  /** Job that most recently produced/updated this record. */
  @ManyToOne(() => CrawlJobEntity, { nullable: true })
  job?: CrawlJobEntity;

  /** Source-side identifier (slug/token) — unique within a target. */
  @Property()
  externalId: string;

  @Property({ nullable: true })
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

  @Property({ nullable: true })
  @Index()
  city?: string;

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
}
