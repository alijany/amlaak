import { Entity, Enum, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { CrawlTargetStatus, TargetAccessibility } from '../crawler.constants';

/**
 * A registered website the platform can crawl. One row per site (e.g. Divar).
 * `siteKey` links the target to its {@link CrawlerProvider} implementation.
 */
@Entity()
export class CrawlTargetEntity extends BaseEntity {
  /** Provider key, e.g. 'divar' | 'mock'. Matches the registry. */
  @Property()
  @Unique()
  siteKey: string;

  @Property()
  name: string;

  @Property()
  baseUrl: string;

  /** Default entry path/url to crawl (e.g. the Gilan real-estate listing). */
  @Property({ nullable: true })
  startPath?: string;

  @Enum({
    items: () => CrawlTargetStatus,
    default: CrawlTargetStatus.NOT_CONFIGURED,
  })
  status: CrawlTargetStatus = CrawlTargetStatus.NOT_CONFIGURED;

  @Enum({
    items: () => TargetAccessibility,
    default: TargetAccessibility.UNKNOWN,
  })
  accessibility: TargetAccessibility = TargetAccessibility.UNKNOWN;

  /** Whether this target requires a logged-in session before crawling. */
  @Property({ default: false })
  requiresAuth: boolean = false;

  /** Free-form, provider-specific configuration. */
  @Property({ type: 'json', nullable: true })
  config?: Record<string, any>;

  @Property({ nullable: true })
  lastError?: string;

  @Property({ type: 'timestamp', nullable: true })
  lastCrawledAt?: Date;
}
