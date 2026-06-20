/**
 * Shared enums and constants for the crawler subsystem.
 *
 * These values are intentionally site-agnostic. A "target" is any external
 * website the platform can crawl (Divar being the first). Everything below is
 * referenced by entities, DTOs, providers and the dashboard so the lifecycle
 * stays consistent end-to-end.
 */

/** Operational state of a registered crawl target. */
export enum CrawlTargetStatus {
  /** Configured and able to run jobs. */
  READY = 'ready',
  /** A job is currently executing against this target. */
  RUNNING = 'running',
  /** Last operation failed; needs attention. */
  ERROR = 'error',
  /** Registered but missing configuration/credentials to run. */
  NOT_CONFIGURED = 'not_configured',
}

/** Reachability of the target website itself. */
export enum TargetAccessibility {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown',
}

/**
 * Authentication state for a target session. Drives the interactive OTP
 * workflow surfaced in the dashboard.
 */
export enum CrawlerAuthStatus {
  /** No valid session; user must start a login. */
  LOGIN_REQUIRED = 'login_required',
  /** Login started, waiting for the user to submit the OTP code. */
  OTP_PENDING = 'otp_pending',
  /** Authenticated; a usable session is stored. */
  LOGGED_IN = 'logged_in',
  /** Authentication failed. */
  ERROR = 'error',
}

/** Lifecycle of a single crawl job. */
export enum CrawlJobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

/** What a crawl job is meant to do. Providers may support a subset. */
export enum CrawlJobType {
  /** Crawl the full listing from scratch. */
  FULL_SCAN = 'full_scan',
  /** Crawl only new/changed items since the last run. */
  INCREMENTAL = 'incremental',
  /** Fetch a single advertisement by id/url. */
  SINGLE_AD = 'single_ad',
}

/** Bull queue name for crawl jobs. */
export const CRAWL_JOBS_QUEUE = 'crawl-jobs';

/** DI token for the browser gateway implementation. */
export const BROWSER_GATEWAY = 'BROWSER_GATEWAY';
