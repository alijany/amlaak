import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from 'src/libs/orm/orm.entity.base';
import { CrawlJobType } from '../crawler.constants';
import { CrawlTargetEntity } from '../targets/crawl-target.entity';

/**
 * A per-target cron schedule that auto-enqueues crawl jobs. One schedule per
 * target (the dashboard manages exactly one), driven by `@nestjs/schedule`'s
 * SchedulerRegistry. Domain-agnostic: it just enqueues via CrawlJobService.
 */
@Entity()
export class CrawlScheduleEntity extends BaseEntity {
  @ManyToOne(() => CrawlTargetEntity)
  @Unique()
  target: CrawlTargetEntity;

  /** Whether the cron is currently registered/firing. */
  @Property({ default: false })
  enabled: boolean = false;

  /** Standard cron expression (5 or 6 fields). */
  @Property()
  cron: string;

  /** IANA timezone the cron is evaluated in. */
  @Property({ default: 'UTC' })
  timezone: string = 'UTC';

  @Enum({ items: () => CrawlJobType, default: CrawlJobType.INCREMENTAL })
  jobType: CrawlJobType = CrawlJobType.INCREMENTAL;

  /** Soft cap on items per scheduled run. */
  @Property({ default: 24 })
  maxItems: number = 24;

  /** Politeness: per-item delay passed to the provider (ms). */
  @Property({ nullable: true })
  crawlDelayMs?: number;

  @Property({ type: 'timestamp', nullable: true })
  lastRunAt?: Date;

  /** Id of the most recent job this schedule enqueued. */
  @Property({ nullable: true })
  lastJobId?: number;
}
