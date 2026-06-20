# Roadmap

Recommended implementation path beyond Phase 1 (the foundation). Each phase is independently
shippable and builds on the extension points already in place. Items are ordered by
dependency, not calendar.

## Phase 1 — Foundation ✅ (this work)

- Crawler module architecture + four core abstractions (`CrawlerProvider`,
  `CrawlerAuthProvider`, `BrowserGateway`, `ExtractionPipeline`).
- Bull-backed jobs with a working **Mock** provider (end-to-end: queue → normalize →
  persist → dashboard).
- Interactive OTP auth state machine (mock-backed) + dashboard UI.
- Real-estate advertisement schema, repository, search API, and data view.
- Divar scaffold (provider/auth wired, `NotImplemented`).
- Documentation under `/docs`.

## Phase 2 — Real browser integration ✅

- ✅ Camoufox sidecar stood up (compose service + `CAMOFOX_*` env; `CAMOFOX_BASE_URL=http://camofox:9377`).
- ✅ `CamofoxBrowserGateway` validated against the live REST API (camofox-browser v1.11.x).
  Request/response shapes corrected: `createTab` sends `userId`+`sessionKey` and reads `tabId`;
  every tab op carries `userId` (via an internal `tabId → sessionId` map); snapshots are mapped
  from the text form into `PageSnapshot.text`; cookie import uses bearer auth.
- ✅ `health()`/`isAvailable()` wired to `GET /health`; browser availability surfaced on the
  dashboard (`GET /crawler/targets/browser` + header status pill).
- ✅ Timeouts + transient-failure retries (backoff) + typed `BrowserGatewayError` mapping around
  all gateway calls.

> Note: `exportCookies` intentionally throws — Camoufox persists profiles server-side and has no
> export endpoint. Durable session export/reconciliation lands in Phase 4.

## Rearchitecture — engine / domain split ✅

Before Phase 3, the crawler was split into a generic engine and a domain module:

- `core-api/src/crawler/` is now a **domain-agnostic engine** (targets, sessions, jobs/queue,
  browser gateway, provider + **sink** registries). Providers return generic `RawCrawlItem`s.
- `core-api/src/real-estate/` is a **domain module** that uses the engine: it owns the
  advertisement entity/store/API (`/real-estate/advertisements`), the normalization pipeline,
  a `RealEstateSink` (`CrawlResultSink`), and the Mock + Divar providers — registering them
  with the engine at startup (`real-estate.registration.ts`). No engine code is domain-aware.

## Phase 3 — Divar implementation ✅

- ✅ **Crawl** (`DivarCrawlerProvider`): opens the Gilan listing, **closes the map overlay**
  ("بستن نقشه"), infinite-scrolls to collect ad cards, then opens each ad's detail page and
  reads the spec table (متراژ/قیمت/قیمت هر متر/ودیعه/اجاره) to enrich the record. Validated
  live (4/4 ads normalized + persisted).
- ✅ **Auth** (`DivarAuthProvider`): OTP flow over the gateway (open login → type phone →
  "بعدی" → type OTP → confirm). Phone step validated live; the OTP step resolves its
  input/button by role+name. Full OTP round-trip needs a real phone/SMS.
- ✅ `divar.constants.ts` + `divar.parser.ts` filled from the **observed** live site (refs are
  per-snapshot, so elements are matched by accessible name/role at runtime).
- ✅ `NormalizationService` handles Divar's real attribute strings (Persian digits, "۱۲۰ متر",
  price strings) via the shared `normalizeNumbers`.

> Notes / follow-ups: category is inferred from detail spec keys (sale vs deposit/rent) with a
> keyword fallback; images and `postedAt` are not yet extracted (Phase 6 AI enrichment is the
> natural home). `sourceUrl` was widened to `text` (Divar URLs are long percent-encoded Persian).

## Phase 4 — Session persistence

- Persist Camoufox profiles/cookies and reconcile with `CrawlSessionEntity`
  (`sessionData`, `expiresAt`).
- Implement `checkSession`/`logout` for real; auto-prompt re-login when a session expires
  (set target → `LOGIN_REQUIRED`).

## Phase 5 — Scheduling

- Add a `CrawlScheduleService` using `@nestjs/schedule` to enqueue `INCREMENTAL` jobs on a
  per-target cron (config-driven), reusing `CrawlJobService.enqueue`.
- Add per-target politeness (crawl-delay, concurrency) and queue `limiter`.

## Phase 6 — AI extraction & enrichment

- Add an `ExtractionPipeline` stage that feeds accessibility **snapshots** (or `raw`) to an
  LLM to (a) extract structured fields without hand-written selectors and (b) enrich records
  (categorization, summaries, quality/anomaly flags).
- Use the latest Claude models for extraction; cache aggressively; keep `rawPayload` so
  enrichment can be re-run offline.

## Phase 7 — Multi-site & verticals

- Onboard additional sites as new providers (no core changes) per
  [adding-a-website-integration.md](./developer/adding-a-website-integration.md).
- For non-real-estate verticals, add sibling entities + pipelines.
- Scale browser fleet + proxy rotation; add observability (queue depth, success rate,
  per-job timings) to the dashboard.

## Cross-cutting backlog

- Review/moderation workflow on collected ads (approve/reject, dedupe across targets).
- Richer dashboard filters (price range UI, map view using `lat`/`lng`).
- Metrics/alerting on crawl failures and accessibility changes.
- Tests once the test harness is stabilized (currently `build` + `lint` is the loop).
