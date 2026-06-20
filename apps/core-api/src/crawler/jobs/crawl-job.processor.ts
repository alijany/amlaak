import { MikroORM, CreateRequestContext } from '@mikro-orm/core';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  CRAWL_JOBS_QUEUE,
  CrawlJobStatus,
  CrawlTargetStatus,
} from '../crawler.constants';
import { CrawlerProviderRegistry } from '../providers/crawler-provider.registry';
import { CrawlResultSinkRegistry } from '../sink/crawl-sink.registry';
import { CrawlSessionService } from '../sessions/crawl-session.service';
import { CrawlTargetService } from '../targets/crawl-target.service';
import { CrawlJobStats } from './crawl-job.entity';
import { CrawlJobPayload, CrawlJobService } from './crawl-job.service';

/**
 * Bull worker that runs a crawl job end-to-end:
 *   resolve provider + sink -> crawl() -> sink.consume() -> update stats.
 *
 * The engine is domain-agnostic: it never touches domain entities. The provider
 * yields raw items; the target's {@link CrawlResultSink} (registered by a domain
 * module) normalizes and persists them.
 *
 * Uses {@link CreateRequestContext} so the MikroORM identity map is scoped per
 * job (Bull runs outside the HTTP request lifecycle); the sink runs inside that
 * same context.
 */
@Processor(CRAWL_JOBS_QUEUE)
export class CrawlJobProcessor {
  private readonly logger = new Logger(CrawlJobProcessor.name);

  constructor(
    // Required by @CreateRequestContext to create the EM fork.
    private readonly orm: MikroORM,
    private readonly jobService: CrawlJobService,
    private readonly targetService: CrawlTargetService,
    private readonly sessionService: CrawlSessionService,
    private readonly registry: CrawlerProviderRegistry,
    private readonly sinks: CrawlResultSinkRegistry,
  ) {}

  @Process()
  @CreateRequestContext()
  async handle(job: Job<CrawlJobPayload>): Promise<void> {
    const { jobId, maxItems } = job.data;
    const crawlJob = await this.jobService.findOne(
      { id: jobId },
      { populate: ['target'] as never },
    );
    if (!crawlJob) {
      this.logger.warn(`Crawl job ${jobId} not found; skipping.`);
      return;
    }
    if (crawlJob.status === CrawlJobStatus.CANCELED) {
      this.logger.log(`Crawl job ${jobId} was canceled; skipping.`);
      return;
    }

    const target = crawlJob.target;
    const provider = this.registry.get(target.siteKey);
    const sink = this.sinks.get(target.siteKey);

    crawlJob.status = CrawlJobStatus.RUNNING;
    crawlJob.startedAt = new Date();
    await this.jobService.persistAndFlush(crawlJob);
    await this.targetService.setStatus(target.id, CrawlTargetStatus.RUNNING);

    let stats: CrawlJobStats = { found: 0, created: 0, updated: 0, skipped: 0 };

    try {
      const session = await this.sessionService.getOrCreate(target.id);

      const items = await provider.crawl({
        targetId: target.id,
        jobId: crawlJob.id,
        jobType: crawlJob.type,
        baseUrl: target.baseUrl + (target.startPath ?? ''),
        params: crawlJob.params,
        session: session.sessionData,
        maxItems,
      });

      const result = await sink.consume(items, { target, job: crawlJob });
      stats = { found: items.length, ...result };

      crawlJob.status = CrawlJobStatus.COMPLETED;
      crawlJob.stats = stats;
      crawlJob.finishedAt = new Date();
      await this.jobService.persistAndFlush(crawlJob);

      await this.targetService.setStatus(target.id, CrawlTargetStatus.READY);
      await this.targetService.markCrawled(target.id);

      this.logger.log(`Crawl job ${jobId} completed: ${JSON.stringify(stats)}`);
    } catch (err: any) {
      const message = err?.message ?? String(err);
      crawlJob.status = CrawlJobStatus.FAILED;
      crawlJob.error = message;
      crawlJob.stats = stats;
      crawlJob.finishedAt = new Date();
      await this.jobService.persistAndFlush(crawlJob);
      await this.targetService.setStatus(
        target.id,
        CrawlTargetStatus.ERROR,
        message,
      );
      this.logger.error(`Crawl job ${jobId} failed: ${message}`);
    }
  }
}
