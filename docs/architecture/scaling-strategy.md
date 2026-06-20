# Scaling Strategy

How the foundation is meant to grow from one mock target to a multi-site platform. Most of
this is **future** work; this document records the intended direction so later phases don't
re-derive it.

## Concurrency & throughput

- **Queue-based already.** Jobs run on a Bull (`crawl-jobs`) queue backed by Redis, so work
  is decoupled from the request and survives restarts. Scaling out is "run more workers".
- **Per-target serialization.** A target moves to `RUNNING` while a job executes. For
  stricter guarantees use Bull job options (e.g. a per-target `jobId`/lock, or
  `limiter`/`concurrency` on the queue) to avoid two jobs hammering one site at once.
- **Rate limiting / politeness.** Add per-target crawl-delay + concurrency to
  `target.config` and honor it in providers (and/or queue `limiter`). Respect robots and
  site ToS.

## Browser fleet (Camoufox)

- The `BrowserGateway` is an HTTP client, so browser capacity scales independently of the
  API. Run N Camoufox sidecars behind a load balancer, or one per worker.
- **Proxies.** Camoufox supports residential/back-connect proxies via env
  (`PROXY_*`, `PROXY_STRATEGY=backconnect`). Rotate proxies per target/session to spread load
  and reduce blocking.
- **Sessions.** Camoufox can persist profiles/cookies; pair that with `CrawlSessionEntity`
  for durable logins (see roadmap: session persistence).

## Multi-site

- Adding a site = a new `CrawlerProvider` + `CrawlerAuthProvider`, registered by `siteKey`.
  Nothing else changes. The registry resolves providers per target at job time.
- Targets, sessions, jobs, and ads are all target-scoped, so multiple sites coexist with no
  cross-talk.
- The advertisement schema is real-estate-specific today. For non-real-estate verticals,
  introduce a sibling entity + pipeline (the `ExtractionPipeline<T>` generic already allows
  this) rather than overloading one table.

## Scheduling

- `@nestjs/schedule` is already installed. A future `CrawlScheduleService` can enqueue
  `INCREMENTAL` jobs on a cron per target (config-driven), reusing `CrawlJobService.enqueue`.

## Data growth

- Index hot filter columns (`title`, `city` are indexed; add `category`, `totalPrice`,
  composite indexes as query patterns emerge).
- Consider partitioning/retention on `RealEstateAdvertisementEntity` once volume is real.
- Object storage (MinIO/S3, already integrated via `S3StorageService`) is the place to
  offload images/snapshots rather than the DB.

## Observability (future)

- Persist per-job timing/stats (already on `CrawlJobEntity`).
- Add structured logs/metrics around the processor and gateway; surface queue depth and
  failure rate on the dashboard.
