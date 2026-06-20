import { Injectable, OnModuleInit } from '@nestjs/common';
import { CrawlerProviderRegistry } from '../crawler/providers/crawler-provider.registry';
import { CrawlResultSinkRegistry } from '../crawler/sink/crawl-sink.registry';
import { DivarCrawlerProvider } from './providers/divar/divar.crawler.provider';
import { MockCrawlerProvider } from './providers/mock/mock.crawler.provider';
import { RealEstateSink } from './real-estate.sink';

/**
 * Plugs the real-estate domain into the generic crawler engine: registers the
 * real-estate providers and a single advertisement sink (shared by every
 * real-estate site key) with the engine's registries.
 *
 * This is the one place that couples this module to the engine — the engine
 * itself never imports anything real-estate.
 */
@Injectable()
export class RealEstateRegistration implements OnModuleInit {
  constructor(
    private readonly providers: CrawlerProviderRegistry,
    private readonly sinks: CrawlResultSinkRegistry,
    private readonly sink: RealEstateSink,
    private readonly mock: MockCrawlerProvider,
    private readonly divar: DivarCrawlerProvider,
  ) {}

  onModuleInit(): void {
    for (const provider of [this.mock, this.divar]) {
      this.providers.register(provider);
      this.sinks.register(provider.metadata.siteKey, this.sink);
    }
  }
}
