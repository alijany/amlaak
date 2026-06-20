import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CrawlResultSink } from './crawl-sink.interface';

/**
 * Lookup of {@link CrawlResultSink}s by `siteKey`. Domain modules register a
 * sink for each site they own (e.g. the real-estate module registers the same
 * advertisement sink for `mock` and `divar`).
 *
 * Mirrors {@link CrawlerProviderRegistry}: registration is explicit (called from
 * a domain module's bootstrap) so the engine never imports domain code.
 */
@Injectable()
export class CrawlResultSinkRegistry {
  private readonly logger = new Logger(CrawlResultSinkRegistry.name);
  private readonly sinks = new Map<string, CrawlResultSink>();

  register(siteKey: string, sink: CrawlResultSink): void {
    this.sinks.set(siteKey, sink);
    this.logger.log(`Registered crawl result sink for site: ${siteKey}`);
  }

  /** Returns the sink for a site key, or throws if none is registered. */
  get(siteKey: string): CrawlResultSink {
    const sink = this.sinks.get(siteKey);
    if (!sink) {
      throw new NotFoundException(
        `No crawl result sink registered for site "${siteKey}"`,
      );
    }
    return sink;
  }

  has(siteKey: string): boolean {
    return this.sinks.has(siteKey);
  }
}
