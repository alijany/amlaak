import { CrawlJobType, RealEstateCategory } from '../crawler.constants';
import { AuthSessionData, CrawlerAuthProvider } from './crawler-auth.interface';

/**
 * Raw advertisement as emitted by a provider's `crawl()`. This is the
 * provider's best-effort, lightly-structured view of a listing. The extraction
 * pipeline normalizes it into a {@link RealEstateAdvertisementEntity}.
 *
 * `externalId` + the target form the natural key used for upserts.
 */
export interface RawAdvertisement {
  externalId: string;
  sourceUrl?: string;
  title?: string;
  description?: string;
  category?: RealEstateCategory;
  /** Free-form fields straight from the source (prices as strings, fa digits, etc.). */
  attributes?: Record<string, unknown>;
  images?: string[];
  postedAt?: string | Date;
  /** Untouched source payload, kept for debugging and re-processing. */
  raw?: unknown;
}

/** Per-run context handed to a provider. */
export interface CrawlContext {
  targetId: number;
  jobId: number;
  jobType: CrawlJobType;
  baseUrl: string;
  /** Provider-specific job params (page count, filters, single-ad url, ...). */
  params?: Record<string, unknown>;
  /** Stored auth session, if the target is logged in. */
  session?: AuthSessionData;
  /** Soft cap so mock/real runs stay bounded. */
  maxItems?: number;
}

export interface ProviderMetadata {
  siteKey: string;
  displayName: string;
  /** Whether this provider needs a logged-in session to crawl. */
  requiresAuth: boolean;
  supportedJobTypes: CrawlJobType[];
}

/**
 * A site-specific crawler implementation. Registered by `siteKey` in the
 * {@link CrawlerProviderRegistry} and resolved per target at job time.
 *
 * Keep providers free of NestJS/HTTP/DB concerns — they receive a context and
 * return raw ads. The pipeline and services handle persistence.
 */
export interface CrawlerProvider {
  readonly metadata: ProviderMetadata;

  getAuthProvider(): CrawlerAuthProvider;

  /** Fetch advertisements for the given run. */
  crawl(ctx: CrawlContext): Promise<RawAdvertisement[]>;
}
