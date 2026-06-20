import { Injectable } from '@nestjs/common';
import {
  CrawlJobType,
  RealEstateCategory,
  SiteKey,
} from '../../crawler.constants';
import { CrawlerAuthProvider } from '../crawler-auth.interface';
import {
  CrawlContext,
  CrawlerProvider,
  ProviderMetadata,
  RawAdvertisement,
} from '../crawler-provider.interface';
import { MockAuthProvider } from './mock.auth.provider';

const CITIES = ['رشت', 'انزلی', 'لاهیجان', 'آستارا', 'لنگرود'];
const TITLES = [
  'آپارتمان نوساز با ویو دریا',
  'ویلا باغ دنج',
  'فروش زمین مسکونی',
  'رهن و اجاره آپارتمان',
  'سوییت مبله کوتاه‌مدت',
];

/**
 * Reference provider that returns deterministic, realistic-looking real-estate
 * ads without touching the network. It lets the full pipeline (queue ->
 * provider -> normalization -> persistence -> dashboard) run today and serves
 * as a template for real providers.
 */
@Injectable()
export class MockCrawlerProvider implements CrawlerProvider {
  readonly metadata: ProviderMetadata = {
    siteKey: SiteKey.MOCK,
    displayName: 'Mock (reference crawler)',
    requiresAuth: false,
    supportedJobTypes: [
      CrawlJobType.FULL_SCAN,
      CrawlJobType.INCREMENTAL,
      CrawlJobType.SINGLE_AD,
    ],
  };

  constructor(private readonly authProvider: MockAuthProvider) {}

  getAuthProvider(): CrawlerAuthProvider {
    return this.authProvider;
  }

  async crawl(ctx: CrawlContext): Promise<RawAdvertisement[]> {
    const count = Math.min(ctx.maxItems ?? 12, 24);
    const ads: RawAdvertisement[] = [];

    for (let i = 0; i < count; i++) {
      const city = CITIES[i % CITIES.length];
      const category =
        i % 3 === 0 ? RealEstateCategory.RENT : RealEstateCategory.SALE;
      const area = 60 + ((i * 17) % 140);
      const rooms = 1 + (i % 4);
      // Unique-ish id per run so repeated jobs upsert rather than duplicate
      // for FULL_SCAN, while INCREMENTAL appends a run-scoped suffix.
      const externalId =
        ctx.jobType === CrawlJobType.INCREMENTAL
          ? `mock-${ctx.jobId}-${i}`
          : `mock-listing-${i}`;

      ads.push({
        externalId,
        sourceUrl: `https://example.com/mock/${externalId}`,
        title: `${TITLES[i % TITLES.length]} (${city})`,
        description: 'آگهی نمونه تولیدشده برای نمایش معماری خزنده.',
        category,
        images: [`https://picsum.photos/seed/${externalId}/640/480`],
        postedAt: new Date(Date.now() - i * 3600_000),
        attributes: {
          city,
          province: 'گیلان',
          district: `منطقه ${1 + (i % 6)}`,
          area: `${area} متر`,
          rooms: `${rooms} خوابه`,
          yearBuilt: `${1390 + (i % 14)}`,
          floor: `${i % 6}`,
          totalPrice:
            category === RealEstateCategory.SALE
              ? `${(area * 45_000_000).toLocaleString('fa-IR')} تومان`
              : undefined,
          deposit:
            category === RealEstateCategory.RENT
              ? `${(rooms * 200_000_000).toLocaleString('fa-IR')} تومان`
              : undefined,
          rent:
            category === RealEstateCategory.RENT
              ? `${(rooms * 12_000_000).toLocaleString('fa-IR')} تومان`
              : undefined,
        },
        raw: { source: 'mock', index: i, jobId: ctx.jobId },
      });
    }

    return ads;
  }
}
