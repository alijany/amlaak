import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import {
  BROWSER_GATEWAY,
  CrawlJobType,
  SiteKey,
} from '../../crawler.constants';
import { BrowserGateway } from '../../browser/browser-gateway.interface';
import { CrawlerAuthProvider } from '../crawler-auth.interface';
import {
  CrawlContext,
  CrawlerProvider,
  ProviderMetadata,
  RawAdvertisement,
} from '../crawler-provider.interface';
import { DivarAuthProvider } from './divar.auth.provider';
import { DIVAR_BASE_URL } from './divar.constants';

/**
 * SCAFFOLD — Divar real-estate crawler.
 *
 * Wired with the same shape as a real provider (metadata, auth, browser
 * gateway) but `crawl()` deliberately throws NotImplemented. A future phase
 * implements it roughly as:
 *   1. ensure a logged-in session (ctx.session)
 *   2. open a tab and navigate to the listing URL
 *   3. snapshot -> collect ad cards/refs -> open each -> snapshot -> map to
 *      RawAdvertisement (or feed the snapshot to an AI extractor)
 *   4. handle pagination / infinite scroll up to ctx.maxItems
 *
 * See {@link DIVAR_BASE_URL} and divar.constants.ts for the target.
 */
@Injectable()
export class DivarCrawlerProvider implements CrawlerProvider {
  readonly metadata: ProviderMetadata = {
    siteKey: SiteKey.DIVAR,
    displayName: 'Divar (real-estate)',
    requiresAuth: true,
    supportedJobTypes: [CrawlJobType.FULL_SCAN, CrawlJobType.INCREMENTAL],
  };

  constructor(
    @Inject(BROWSER_GATEWAY) private readonly browser: BrowserGateway,
    private readonly authProvider: DivarAuthProvider,
  ) {}

  getAuthProvider(): CrawlerAuthProvider {
    return this.authProvider;
  }

  async crawl(ctx: CrawlContext): Promise<RawAdvertisement[]> {
    void ctx;
    throw new NotImplementedException(
      `Divar crawling is not implemented yet (target: ${DIVAR_BASE_URL}). ` +
        'This scaffold defines the extension point; see docs/roadmap.md.',
    );
  }
}
