import { CrawlJobType } from '../crawler.constants';
import { AuthSessionData, CrawlerAuthProvider } from './crawler-auth.interface';

/**
 * A single raw record emitted by a provider's `crawl()`. The engine is
 * domain-agnostic: it only knows that an item has a stable `externalId`
 * (so `(target, externalId)` can be used as an upsert key) and an opaque
 * `data` bag. The target's {@link CrawlResultSink} interprets `data` into a
 * domain entity (e.g. a real-estate advertisement).
 */
export interface RawCrawlItem {
  externalId: string;
  sourceUrl?: string;
  /** Domain fields, interpreted downstream by the sink. */
  data?: Record<string, unknown>;
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
 * Keep providers free of DB concerns — they receive a context and return raw
 * items. The target's {@link CrawlResultSink} handles normalization/persistence.
 */
export interface CrawlerProvider {
  readonly metadata: ProviderMetadata;

  getAuthProvider(): CrawlerAuthProvider;

  /** Fetch raw items for the given run. */
  crawl(ctx: CrawlContext): Promise<RawCrawlItem[]>;
}
