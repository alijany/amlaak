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
import {
  DIVAR_ANCHORS,
  DIVAR_AMENITIES_MORE,
  DIVAR_GILAN_PROVINCE,
  DIVAR_IMAGE_FULL_MARKER,
  DIVAR_IMAGE_HOST,
  DIVAR_MAX_IMAGES,
} from './divar.constants';
import {
  DivarListingCard,
  extractAreaFromText,
  extractRoomsFromText,
  findRef,
  inferCategory,
  parseBreadcrumbCategory,
  parseBreadcrumbLocation,
  parseBreadcrumbSubtype,
  parseContactPhone,
  parseDetailAmenities,
  parseDetailDescription,
  parseDetailSpecs,
  parseListingCards,
} from './divar.parser';

/**
 * Divar real-estate crawler (Gilan province), driven over the browser gateway.
 *
 * Flow (validated against the live site):
 *   1. Open a tab on the listing URL.
 *   2. Close the map overlay ("بستن نقشه") so the list takes the full width.
 *   3. Snapshot + scroll repeatedly to collect ad cards (infinite scroll).
 *      Promoted cards (پله شده / نردبان شده) are de-duplicated by token.
 *   4. For each card, open its detail page and extract:
 *      - Spec table (area/year/rooms via `columnheader/cell`) + paragraph pairs
 *      - Description text (after "توضیحات" heading)
 *      - Amenities table cells + "سایر ویژگی‌ها" expansion
 *      - Category + subtype from breadcrumb URL/link name
 *      - City/district from the time-location button ("دقایقی پیش در <city>")
 *      - Seller phone (click "اطلاعات تماس", then "نمایش شماره" if needed)
 *      - Images from the CDN
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

    const maxScrolls = Math.max(
      1,
      Math.min(Number(ctx.params?.maxScrolls ?? this.maxScrolls), 50),
    );

    try {
      await this.sleep(3500);
      await this.closeMapIfPresent(tab.id);

      const cards = await this.collectCards(tab.id, maxItems, maxScrolls);
      this.logger.log(
        `Divar: collected ${cards.length} cards (cap ${maxItems}, scrolls ${maxScrolls}).`,
      );

      const detailDelay = Number(
        ctx.params?.crawlDelayMs ?? this.detailDelayMs,
      );
      const ads: RawAdvertisement[] = [];
      for (const card of cards.slice(0, maxItems)) {
        ads.push(await this.buildAd(tab.id, card));
        await this.sleep(detailDelay);
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
    maxScrolls: number,
  ): Promise<DivarListingCard[]> {
    const byToken = new Map<string, DivarListingCard>();
    let stalls = 0;

    for (let i = 0; i < maxScrolls; i++) {
      const snapshot = await this.browser.snapshot(tabId);
      const before = byToken.size;
      for (const card of parseListingCards(snapshot.text)) {
        if (!byToken.has(card.token)) byToken.set(card.token, card);
      }
      if (byToken.size >= target) break;

      stalls = byToken.size === before ? stalls + 1 : 0;
      if (stalls >= 2) break;

      await this.browser.scroll(tabId, { direction: 'down', amount: 3000 });
      await this.sleep(1500);
    }
    return [...byToken.values()];
  }

  /** Open a card's detail page and merge all extracted data into a RawAdvertisement. */
  private async buildAd(
    tabId: string,
    card: DivarListingCard,
  ): Promise<RawAdvertisement> {
    const combined = `${card.title} ${card.metaText}`;
    const attributes: Record<string, unknown> = {
      province: DIVAR_GILAN_PROVINCE,
      listingText: card.metaText,
    };

    const cardArea = extractAreaFromText(combined);
    const cardRooms = extractRoomsFromText(combined);
    if (cardArea) attributes.area = cardArea;
    if (cardRooms) attributes.rooms = cardRooms;

    let description: string | undefined;
    let category: RealEstateCategory | undefined;
    let images: string[] = [];

    try {
      await this.browser.navigate(tabId, card.sourceUrl);
      await this.sleep(2500);
      const detail = await this.browser.snapshot(tabId);

      // ── specs (table + paragraph pairs) ──────────────────────────────────
      Object.assign(attributes, parseDetailSpecs(detail.text));

      // ── description ───────────────────────────────────────────────────────
      description = parseDetailDescription(detail.text);

      // ── breadcrumb: category, subtype, location ───────────────────────────
      category = parseBreadcrumbCategory(detail.text);
      const subtype = parseBreadcrumbSubtype(detail.text);
      if (subtype) attributes.propertySubtype = subtype;

      const { city, district } = parseBreadcrumbLocation(detail.text);
      if (city) attributes.city = city;
      if (district) attributes.district = district;

      // ── amenities: visible table + expanded section ───────────────────────
      await this.expandAmenities(tabId, detail.text);
      const afterExpand = await this.browser.snapshot(tabId);
      const amenities = parseDetailAmenities(afterExpand.text);
      if (amenities.length > 0) attributes.amenities = amenities;

      // ── contact phone ─────────────────────────────────────────────────────
      const phone = await this.extractContactPhone(tabId);
      if (phone) attributes.phone = phone;

      // ── images ────────────────────────────────────────────────────────────
      images = await this.extractImages(tabId);
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
        description,
        category: this.resolveCategory(combined, attributes, category),
        images,
        attributes,
      },
    });
  }

  /**
   * Click "سایر ویژگی‌ها و امکانات" if present to expand the full amenities
   * list.  This is a best-effort step — failures are silently ignored.
   */
  private async expandAmenities(
    tabId: string,
    snapshotText: string,
  ): Promise<void> {
    const ref = findRef(snapshotText, {
      role: 'button',
      nameIncludes: DIVAR_AMENITIES_MORE,
    });
    if (!ref) return;
    try {
      await this.browser.click(tabId, ref);
      await this.sleep(1000);
    } catch {
      // Non-fatal: amenities table cells were already captured.
    }
  }

  /**
   * Click "اطلاعات تماس" and, if a secondary "نمایش شماره" button appears,
   * click that too.  Then parse the first phone number from the updated snapshot.
   * Requires an authenticated browser session; silently returns undefined if the
   * button is absent or the session is not logged in.
   */
  private async extractContactPhone(
    tabId: string,
  ): Promise<string | undefined> {
    try {
      const snap1 = await this.browser.snapshot(tabId);
      const contactRef = findRef(snap1.text, {
        role: 'button',
        nameIncludes: DIVAR_ANCHORS.contactInfo,
      });
      if (!contactRef) return undefined;

      await this.browser.click(tabId, contactRef);
      await this.sleep(1500);

      const snap2 = await this.browser.snapshot(tabId);

      // Some ads show an intermediate "نمایش شماره" button after the first click.
      const showRef = findRef(snap2.text, {
        role: 'button',
        nameIncludes: DIVAR_ANCHORS.showPhone,
      });
      if (showRef) {
        await this.browser.click(tabId, showRef);
        await this.sleep(1000);
        const snap3 = await this.browser.snapshot(tabId);
        return parseContactPhone(snap3.text);
      }

      return parseContactPhone(snap2.text);
    } catch (err) {
      this.logger.debug(
        `Divar: contact phone extraction skipped for tab ${tabId}: ${
          (err as Error)?.message ?? err
        }`,
      );
      return undefined;
    }
  }

  /**
   * Resolve final category using a priority chain:
   *   1. Breadcrumb URL segment (most reliable)
   *   2. Spec table keys (deposit/rent → RENT; totalPrice → SALE)
   *   3. Keyword inference on card text
   */
  private resolveCategory(
    cardText: string,
    attributes: Record<string, unknown>,
    breadcrumbCategory: RealEstateCategory | undefined,
  ): RealEstateCategory {
    if (breadcrumbCategory) return breadcrumbCategory;
    if (attributes.deposit != null || attributes.rent != null) {
      return RealEstateCategory.RENT;
    }
    if (attributes.totalPrice != null || attributes.pricePerMeter != null) {
      return RealEstateCategory.SALE;
    }
    return inferCategory(cardText);
  }

  /** Collect the ad's full-size CDN photo URLs from the detail page. */
  private async extractImages(tabId: string): Promise<string[]> {
    const images = await this.browser.listImages(tabId);
    const cdn = images.filter((img) => img.src?.includes(DIVAR_IMAGE_HOST));
    const full = cdn.filter((img) => img.src.includes(DIVAR_IMAGE_FULL_MARKER));
    const chosen = (full.length ? full : cdn).map((img) => img.src);
    return [...new Set(chosen)].slice(0, DIVAR_MAX_IMAGES);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
