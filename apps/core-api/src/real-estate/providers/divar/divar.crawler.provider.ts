import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BROWSER_GATEWAY,
  CrawlJobType,
} from '../../../crawler/crawler.constants';
import { BrowserGateway } from '../../../crawler/browser/browser-gateway.interface';
import { CrawlerAuthProvider } from '../../../crawler/providers/crawler-auth.interface';
import {
  CrawlContext,
  CrawlerProvider,
  ProviderMetadata,
} from '../../../crawler/providers/crawler-provider.interface';
import { RealEstateCategory, SiteKey } from '../../real-estate.constants';
import { RawAdvertisement, toRawAdvertisement } from '../../real-estate.raw';
import { DivarAuthProvider } from './divar.auth.provider';
import { DIVAR_ANCHORS, DIVAR_GILAN_PROVINCE } from './divar.constants';
import {
  DivarListingCard,
  extractAreaFromText,
  extractRoomsFromText,
  findRef,
  inferCategory,
  parseDetailSpecs,
  parseListingCards,
} from './divar.parser';

/**
 * Divar real-estate crawler (Gilan province), driven over the browser gateway.
 *
 * Flow (validated against the live site):
 *   1. open a tab on the listing URL
 *   2. close the map overlay ("بستن نقشه") so the list takes the full width
 *   3. snapshot + scroll repeatedly to collect ad cards (infinite scroll)
 *   4. for each card up to `maxItems`, open its detail page and read the spec
 *      table (متراژ/قیمت/ودیعه/اجاره/…) to enrich the record
 *
 * Element refs are resolved from each snapshot at runtime (Divar's refs are not
 * stable across snapshots); see divar.parser.ts.
 */
@Injectable()
export class DivarCrawlerProvider implements CrawlerProvider {
  private readonly logger = new Logger(DivarCrawlerProvider.name);

  readonly metadata: ProviderMetadata = {
    siteKey: SiteKey.DIVAR,
    displayName: 'Divar (real-estate)',
    requiresAuth: true,
    supportedJobTypes: [CrawlJobType.FULL_SCAN, CrawlJobType.INCREMENTAL],
  };

  /** Max scroll iterations before giving up on loading more cards. */
  private readonly maxScrolls = 25;
  /** Politeness delay between detail-page fetches (ms). */
  private readonly detailDelayMs = 700;

  constructor(
    @Inject(BROWSER_GATEWAY) private readonly browser: BrowserGateway,
    private readonly authProvider: DivarAuthProvider,
  ) {}

  getAuthProvider(): CrawlerAuthProvider {
    return this.authProvider;
  }

  async crawl(ctx: CrawlContext): Promise<RawAdvertisement[]> {
    const maxItems = Math.max(1, Math.min(ctx.maxItems ?? 12, 60));
    const sessionId = `target-${ctx.targetId}`;

    const tab = await this.browser.createTab({
      sessionId,
      url: ctx.baseUrl,
    });

    try {
      await this.sleep(3500);
      await this.closeMapIfPresent(tab.id);

      const cards = await this.collectCards(tab.id, maxItems);
      this.logger.log(
        `Divar: collected ${cards.length} cards (cap ${maxItems}).`,
      );

      const ads: RawAdvertisement[] = [];
      for (const card of cards.slice(0, maxItems)) {
        ads.push(await this.buildAd(tab.id, card));
        await this.sleep(this.detailDelayMs);
      }
      return ads;
    } finally {
      await this.browser.closeTab(tab.id).catch(() => undefined);
    }
  }

  /** Close the map overlay (desktop) if its button is on the page. */
  private async closeMapIfPresent(tabId: string): Promise<void> {
    const snapshot = await this.browser.snapshot(tabId);
    const ref = findRef(snapshot.text, {
      role: 'button',
      nameIncludes: DIVAR_ANCHORS.closeMap,
    });
    if (ref) {
      await this.browser.click(tabId, ref);
      await this.sleep(1200);
      this.logger.debug('Divar: closed map overlay.');
    }
  }

  /** Scroll to load cards until we have `target` unique ones or growth stalls. */
  private async collectCards(
    tabId: string,
    target: number,
  ): Promise<DivarListingCard[]> {
    const byToken = new Map<string, DivarListingCard>();
    let stalls = 0;

    for (let i = 0; i < this.maxScrolls; i++) {
      const snapshot = await this.browser.snapshot(tabId);
      const before = byToken.size;
      for (const card of parseListingCards(snapshot.text)) {
        if (!byToken.has(card.token)) byToken.set(card.token, card);
      }
      if (byToken.size >= target) break;

      // No new cards two scrolls in a row -> assume end of list.
      stalls = byToken.size === before ? stalls + 1 : 0;
      if (stalls >= 2) break;

      await this.browser.scroll(tabId, { direction: 'down', amount: 3000 });
      await this.sleep(1500);
    }
    return [...byToken.values()];
  }

  /** Open a card's detail page and merge its spec table into a RawAdvertisement. */
  private async buildAd(
    tabId: string,
    card: DivarListingCard,
  ): Promise<RawAdvertisement> {
    const combined = `${card.title} ${card.metaText}`;
    const attributes: Record<string, unknown> = {
      province: DIVAR_GILAN_PROVINCE,
      listingText: card.metaText,
    };

    // Best-effort fields straight from the card (used if detail fetch fails).
    const cardArea = extractAreaFromText(combined);
    const cardRooms = extractRoomsFromText(combined);
    if (cardArea) attributes.area = cardArea;
    if (cardRooms) attributes.rooms = cardRooms;

    try {
      await this.browser.navigate(tabId, card.sourceUrl);
      await this.sleep(2500);
      const detail = await this.browser.snapshot(tabId);
      Object.assign(attributes, parseDetailSpecs(detail.text));
    } catch (err) {
      this.logger.warn(
        `Divar: detail fetch failed for ${card.token}: ${
          (err as Error)?.message ?? err
        }`,
      );
    }

    return toRawAdvertisement({
      externalId: card.token,
      sourceUrl: card.sourceUrl,
      raw: { card, attributes },
      fields: {
        title: card.title,
        category: this.categoryFor(combined, attributes),
        attributes,
      },
    });
  }

  /**
   * Prefer the detail spec keys (a deposit/rent → rental; a sale price →
   * sale), falling back to keyword inference on the card text.
   */
  private categoryFor(
    text: string,
    attributes: Record<string, unknown>,
  ): RealEstateCategory {
    if (attributes.deposit != null || attributes.rent != null) {
      return RealEstateCategory.RENT;
    }
    if (attributes.totalPrice != null || attributes.pricePerMeter != null) {
      return RealEstateCategory.SALE;
    }
    return inferCategory(text);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
