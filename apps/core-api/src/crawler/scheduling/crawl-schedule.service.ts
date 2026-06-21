import {
  CreateRequestContext,
  EntityRepository,
  MikroORM,
} from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import {
  BadRequestException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CrawlJobType } from '../crawler.constants';
import { CrawlJobService } from '../jobs/crawl-job.service';
import { CrawlTargetService } from '../targets/crawl-target.service';
import { CrawlScheduleEntity } from './crawl-schedule.entity';
import { UpsertCrawlScheduleDto } from './dtos/crawl-schedule.dto';

@Injectable()
export class CrawlScheduleService
  extends BaseRepositoryService<CrawlScheduleEntity>
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(CrawlScheduleService.name);

  constructor(
    @InjectRepository(CrawlScheduleEntity)
    protected repository: EntityRepository<CrawlScheduleEntity>,
    // Required by @CreateRequestContext for cron/bootstrap (no HTTP context).
    private readonly orm: MikroORM,
    private readonly scheduler: SchedulerRegistry,
    private readonly jobService: CrawlJobService,
    private readonly targetService: CrawlTargetService,
  ) {
    super(repository);
  }

  @CreateRequestContext()
  async onApplicationBootstrap(): Promise<void> {
    const [schedules] = await this.findAll({ enabled: true });
    for (const schedule of schedules) this.syncCron(schedule);
    this.logger.log(
      `Registered ${schedules.length} enabled crawl schedule(s).`,
    );
  }

  // --- CRUD -------------------------------------------------------------

  async list(): Promise<CrawlScheduleEntity[]> {
    const [items] = await this.findAll({}, { populate: ['target'] as never });
    return items;
  }

  async getByTarget(targetId: number): Promise<CrawlScheduleEntity | null> {
    return this.findOne(
      { target: targetId },
      { populate: ['target'] as never },
    );
  }

  /** Create or replace a target's schedule, then (re)register its cron. */
  async upsert(
    targetId: number,
    dto: UpsertCrawlScheduleDto,
  ): Promise<CrawlScheduleEntity> {
    const target = await this.targetService.getByIdOrThrow(targetId);
    this.assertValidCron(dto.cron, dto.timezone);

    let schedule = await this.getByTarget(targetId);
    const patch = {
      cron: dto.cron,
      timezone: dto.timezone ?? schedule?.timezone ?? 'UTC',
      jobType: dto.jobType ?? schedule?.jobType ?? CrawlJobType.INCREMENTAL,
      maxItems: dto.maxItems ?? schedule?.maxItems ?? 24,
      crawlDelayMs: dto.crawlDelayMs ?? schedule?.crawlDelayMs,
      maxScrolls: dto.maxScrolls ?? schedule?.maxScrolls,
      enabled: dto.enabled ?? schedule?.enabled ?? false,
    };

    if (schedule) {
      this.em.assign(schedule, patch);
    } else {
      schedule = this.repository.create({ target, ...patch });
    }
    await this.persistAndFlush(schedule);
    this.syncCron(schedule);
    return schedule;
  }

  async setEnabled(
    targetId: number,
    enabled: boolean,
  ): Promise<CrawlScheduleEntity> {
    const schedule = await this.getByTarget(targetId);
    if (!schedule) {
      throw new BadRequestException('No schedule configured for this target.');
    }
    schedule.enabled = enabled;
    await this.persistAndFlush(schedule);
    this.syncCron(schedule);
    return schedule;
  }

  async remove(targetId: number): Promise<void> {
    const schedule = await this.getByTarget(targetId);
    if (!schedule) return;
    this.unregisterCron(schedule.id);
    await this.em.removeAndFlush(schedule);
  }

  /** Enqueue a job immediately (the "run now" button). */
  async runNow(targetId: number) {
    const schedule = await this.getByTarget(targetId);
    return this.jobService.enqueue(targetId, {
      type: schedule?.jobType ?? CrawlJobType.INCREMENTAL,
      maxItems: schedule?.maxItems,
      params: schedule ? this.paramsFor(schedule) : undefined,
    });
  }

  /** Build the provider params (politeness/scroll depth) for a scheduled run. */
  private paramsFor(
    schedule: CrawlScheduleEntity,
  ): Record<string, number> | undefined {
    const params: Record<string, number> = {};
    if (schedule.crawlDelayMs != null)
      params.crawlDelayMs = schedule.crawlDelayMs;
    if (schedule.maxScrolls != null) params.maxScrolls = schedule.maxScrolls;
    return Object.keys(params).length ? params : undefined;
  }

  /** Next fire time for a schedule's cron (computed, for display). */
  nextRunAt(schedule: CrawlScheduleEntity): Date | undefined {
    if (!schedule.enabled) return undefined;
    try {
      const job = new CronJob(
        schedule.cron,
        () => {},
        null,
        false,
        schedule.timezone,
      );
      const next = job.nextDate() as unknown as {
        toJSDate?: () => Date;
      };
      return next.toJSDate
        ? next.toJSDate()
        : new Date(next as unknown as string);
    } catch {
      return undefined;
    }
  }

  // --- cron wiring ------------------------------------------------------

  private cronName(id: number): string {
    return `crawl-schedule-${id}`;
  }

  private assertValidCron(cron: string, timezone?: string): void {
    try {
      // Constructing validates the expression (and timezone) without starting.
      new CronJob(cron, () => {}, null, false, timezone ?? 'UTC');
    } catch (err: any) {
      throw new BadRequestException(
        `Invalid cron expression or timezone: ${err?.message ?? err}`,
      );
    }
  }

  /** Register (or replace) the cron for a schedule if enabled, else remove it. */
  private syncCron(schedule: CrawlScheduleEntity): void {
    this.unregisterCron(schedule.id);
    if (!schedule.enabled) return;
    const job = new CronJob(
      schedule.cron,
      () => void this.runScheduled(schedule.id),
      null,
      false,
      schedule.timezone,
    );
    this.scheduler.addCronJob(this.cronName(schedule.id), job as never);
    job.start();
    this.logger.log(
      `Scheduled target ${schedule.target.id} ("${schedule.cron}" ${schedule.timezone}).`,
    );
  }

  private unregisterCron(id: number): void {
    const name = this.cronName(id);
    try {
      if (this.scheduler.getCronJobs().has(name)) {
        this.scheduler.deleteCronJob(name);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to remove cron ${name}: ${err?.message ?? err}`);
    }
  }

  /** Cron tick: enqueue the scheduled job. Runs in its own EM context. */
  @CreateRequestContext()
  async runScheduled(scheduleId: number): Promise<void> {
    const schedule = await this.findOne(
      { id: scheduleId },
      { populate: ['target'] as never },
    );
    if (!schedule || !schedule.enabled) return;
    try {
      const job = await this.jobService.enqueue(schedule.target.id, {
        type: schedule.jobType,
        maxItems: schedule.maxItems,
        params: this.paramsFor(schedule),
      });
      schedule.lastRunAt = new Date();
      schedule.lastJobId = job.id;
      await this.persistAndFlush(schedule);
      this.logger.log(
        `Schedule ${scheduleId} enqueued job ${job.id} for target ${schedule.target.id}.`,
      );
    } catch (err: any) {
      this.logger.error(
        `Schedule ${scheduleId} failed to enqueue: ${err?.message ?? err}`,
      );
    }
  }
}
