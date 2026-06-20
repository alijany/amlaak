import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CrawlerProvider } from './crawler-provider.interface';

/**
 * Central lookup of crawler providers by `siteKey`.
 *
 * The engine stays domain-agnostic: providers are registered explicitly by the
 * domain module that owns them (see the real-estate module's registration),
 * not imported here. To add a website: implement {@link CrawlerProvider} in a
 * domain module and call {@link register} during that module's bootstrap.
 */
@Injectable()
export class CrawlerProviderRegistry {
  private readonly logger = new Logger(CrawlerProviderRegistry.name);
  private readonly providers = new Map<string, CrawlerProvider>();

  register(provider: CrawlerProvider): void {
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
