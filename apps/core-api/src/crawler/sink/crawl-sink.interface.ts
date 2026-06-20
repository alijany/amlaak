import { RawCrawlItem } from '../providers/crawler-provider.interface';
import { CrawlJobEntity } from '../jobs/crawl-job.entity';
import { CrawlTargetEntity } from '../targets/crawl-target.entity';

/** Context for a sink run: the target and the job that produced the items. */
export interface CrawlSinkContext {
  target: CrawlTargetEntity;
  job: CrawlJobEntity;
}

/** Aggregate outcome of persisting a batch of raw items. */
export interface CrawlSinkResult {
  created: number;
  updated: number;
  skipped: number;
}

/**
 * Domain seam between the generic crawl engine and a domain's persistence.
 *
 * The engine resolves a sink by `siteKey` and hands it the raw items a provider
 * produced; the sink normalizes and persists them into a domain store (e.g. the
 * real-estate module turns items into advertisements). This keeps the engine —
 * targets, sessions, jobs, queue, browser — free of any domain entity.
 *
 * Implementations register themselves with the {@link CrawlResultSinkRegistry}.
 */
export interface CrawlResultSink {
  consume(
    items: RawCrawlItem[],
    ctx: CrawlSinkContext,
  ): Promise<CrawlSinkResult>;
}
