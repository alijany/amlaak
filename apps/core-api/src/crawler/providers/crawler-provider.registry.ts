import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CrawlerProvider } from './crawler-provider.interface';
import { DivarCrawlerProvider } from './divar/divar.crawler.provider';
import { MockCrawlerProvider } from './mock/mock.crawler.provider';

/**
 * Central lookup of crawler providers by `siteKey`.
 *
 * To add a new website: implement {@link CrawlerProvider}, register the class
 * as a provider in {@link CrawlerModule}, inject it here and add it to the map.
 * Nothing else in the system needs to know the concrete type.
 */
@Injectable()
export class CrawlerProviderRegistry {
  private readonly logger = new Logger(CrawlerProviderRegistry.name);
  private readonly providers = new Map<string, CrawlerProvider>();

  constructor(mock: MockCrawlerProvider, divar: DivarCrawlerProvider) {
    this.register(mock);
    this.register(divar);
  }

  private register(provider: CrawlerProvider): void {
    this.providers.set(provider.metadata.siteKey, provider);
    this.logger.log(
      `Registered crawler provider: ${provider.metadata.siteKey}`,
    );
  }

  /** Returns the provider for a site key, or throws if none is registered. */
  get(siteKey: string): CrawlerProvider {
    const provider = this.providers.get(siteKey);
    if (!provider) {
      throw new NotFoundException(
        `No crawler provider registered for site "${siteKey}"`,
      );
    }
    return provider;
  }

  has(siteKey: string): boolean {
    return this.providers.has(siteKey);
  }

  list(): CrawlerProvider[] {
    return [...this.providers.values()];
  }
}
