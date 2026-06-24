// Mirror of the backend crawler enums/contracts (apps/core-api/src/crawler).
// Kept in the domain per the frontend's domain-driven convention.

export enum CrawlTargetStatus {
  READY = 'ready',
  RUNNING = 'running',
  ERROR = 'error',
  NOT_CONFIGURED = 'not_configured',
}

export enum TargetAccessibility {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown',
}

export enum CrawlerAuthStatus {
  LOGIN_REQUIRED = 'login_required',
  OTP_PENDING = 'otp_pending',
  LOGGED_IN = 'logged_in',
  ERROR = 'error',
}

export enum CrawlJobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export enum CrawlJobType {
  FULL_SCAN = 'full_scan',
  INCREMENTAL = 'incremental',
  SINGLE_AD = 'single_ad',
}

export enum AdvertisementSource {
  CRAWLER = 'crawler',
  USER = 'user',
}

export enum RealEstateCategory {
  SALE = 'sale',
  RENT = 'rent',
  MORTGAGE = 'mortgage',
  UNKNOWN = 'unknown',
}

export enum PublishStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

export interface CrawlTarget {
  id: number;
  siteKey: string;
  name: string;
  baseUrl: string;
  startPath?: string;
  status: CrawlTargetStatus;
  accessibility: TargetAccessibility;
  requiresAuth: boolean;
  lastError?: string;
  lastCrawledAt?: string;
  config?: Record<string, unknown>;
}

export interface AuthView {
  targetId: number;
  authStatus: CrawlerAuthStatus;
  phone?: string;
  expiresAt?: string;
  lastError?: string;
}

export interface ProviderMetadata {
  siteKey: string;
  displayName: string;
  requiresAuth: boolean;
  supportedJobTypes: CrawlJobType[];
}

export interface BrowserHealth {
  available: boolean;
  configured: boolean;
  engine?: string;
  browserConnected?: boolean;
  activeTabs?: number;
  activeSessions?: number;
  error?: string;
}

export interface CrawlSchedule {
  targetId: number;
  target?: { id: number; name: string; siteKey: string };
  enabled: boolean;
  cron: string;
  timezone: string;
  jobType: CrawlJobType;
  maxItems: number;
  crawlDelayMs?: number;
  maxScrolls?: number;
  lastRunAt?: string;
  lastJobId?: number;
  nextRunAt?: string;
}

export interface UpsertScheduleDto {
  cron: string;
  timezone?: string;
  jobType?: CrawlJobType;
  maxItems?: number;
  crawlDelayMs?: number;
  maxScrolls?: number;
  enabled?: boolean;
}

export interface CrawlJobStats {
  found?: number;
  created?: number;
  updated?: number;
  skipped?: number;
}

export interface CrawlJob {
  id: number;
  target: CrawlTarget;
  type: CrawlJobType;
  status: CrawlJobStatus;
  stats?: CrawlJobStats;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  created_at: string;
}

export interface CrawlJobsResponse {
  items: CrawlJob[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface CreateJobDto {
  type?: CrawlJobType;
  maxItems?: number;
  params?: Record<string, unknown>;
}

export interface Advertisement {
  id: number;
  source: AdvertisementSource;
  target?: CrawlTarget;
  externalId?: string;
  sourceUrl?: string;
  title?: string;
  description?: string;
  category: RealEstateCategory;
  totalPrice?: number;
  deposit?: number;
  rent?: number;
  pricePerMeter?: number;
  area?: number;
  rooms?: number;
  yearBuilt?: number;
  floor?: number;
  province?: string;
  city?: string;
  district?: string;
  images?: string[];
  attributes?: Record<string, unknown>;
  rawPayload?: Record<string, unknown>;
  postedAt?: string;
  crawledAt?: string;
  publishStatus?: PublishStatus;
  publishedAt?: string;
  telegramPostedAt?: string;
}

export interface AdvertisementsResponse {
  items: Advertisement[];
  meta: { page: number; limit: number; total: number; pageCount: number };
}

export interface AdvertisementFilters {
  page?: number;
  limit?: number;
  source?: AdvertisementSource;
  targetId?: number;
  category?: RealEstateCategory;
  publishStatus?: PublishStatus;
  city?: string;
  district?: string;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}
