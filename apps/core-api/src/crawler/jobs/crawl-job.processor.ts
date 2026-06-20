import { MikroORM, CreateRequestContext } from '@mikro-orm/core';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  CRAWL_JOBS_QUEUE,
  CrawlJobStatus,
  CrawlTargetStatus,
} from '../crawler.constants';
import { AdvertisementService } from '../pipeline/advertisement.service';
import { NormalizationService } from '../pipeline/normalization.service';
import { CrawlerProviderRegistry } from '../providers/crawler-provider.registry';
import { CrawlSessionService } from '../sessions/crawl-session.service';
import { CrawlTargetService } from '../targets/crawl-target.service';
import { CrawlJobStats } from './crawl-job.entity';
import { CrawlJobPayload, CrawlJobService } from './crawl-job.service';

/**
 * Bull worker that runs a crawl job end-to-end:
 *   resolve provider -> crawl() -> normalize each ad -> upsert -> update stats.
 *
 * Uses {@link CreateRequestContext} so the MikroORM identity map is scoped per
 * job (Bull runs outside the HTTP request lifecycle). With the Mock provider
 * this path is fully functional today.
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
    private readonly normalization: NormalizationService,
    private readonly advertisements: AdvertisementService,
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

    crawlJob.status = CrawlJobStatus.RUNNING;
    crawlJob.startedAt = new Date();
    await this.jobService.persistAndFlush(crawlJob);
    await this.targetService.setStatus(target.id, CrawlTargetStatus.RUNNING);

    const stats: CrawlJobStats = {
      found: 0,
      created: 0,
      updated: 0,
      skipped: 0,
    };

    try {
      const session = await this.sessionService.getOrCreate(target.id);

      const rawAds = await provider.crawl({
        targetId: target.id,
        jobId: crawlJob.id,
        jobType: crawlJob.type,
        baseUrl: target.baseUrl + (target.startPath ?? ''),
        params: crawlJob.params,
        session: session.sessionData,
        maxItems,
      });

      stats.found = rawAds.length;

      for (const raw of rawAds) {
        try {
          const normalized = this.normalization.extract(raw);
          const { created } = await this.advertisements.upsert(
            target,
            crawlJob,
            normalized,
          );
          if (created) stats.created!++;
          else stats.updated!++;
        } catch (err: any) {
          stats.skipped!++;
          this.logger.warn(
            `Failed to persist ad ${raw.externalId}: ${err?.message ?? err}`,
          );
        }
      }

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
