import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { CrawlJobStatus, CrawlJobType } from '../crawler.constants';
import { CrawlTargetEntity } from '../targets/crawl-target.entity';

/** Stats accumulated while a job runs. */
export interface CrawlJobStats {
  found?: number;
  created?: number;
  updated?: number;
  skipped?: number;
}

/**
 * A single crawl run against a target. Created in PENDING, enqueued to Bull,
 * then progressed by the processor through RUNNING -> COMPLETED/FAILED.
 */
@Entity()
export class CrawlJobEntity extends BaseEntity {
  @ManyToOne(() => CrawlTargetEntity)
  target: CrawlTargetEntity;

  @Enum({ items: () => CrawlJobType, default: CrawlJobType.FULL_SCAN })
  type: CrawlJobType = CrawlJobType.FULL_SCAN;

  @Enum({ items: () => CrawlJobStatus, default: CrawlJobStatus.PENDING })
  status: CrawlJobStatus = CrawlJobStatus.PENDING;

  /** Provider-specific run params (pages, filters, single-ad url, ...). */
  @Property({ type: 'json', nullable: true })
  params?: Record<string, any>;

  @Property({ type: 'json', nullable: true })
  stats?: CrawlJobStats;

  @Property({ type: 'text', nullable: true })
  error?: string;

  @Property({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Property({ type: 'timestamp', nullable: true })
  finishedAt?: Date;
}
