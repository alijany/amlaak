# Adding a New Website Integration

End-to-end checklist for onboarding a new target site. Builds on
[adding-a-crawler.md](./adding-a-crawler.md) (the provider) and
[authentication-providers.md](./authentication-providers.md) (the auth, if needed).

## Backend

1. **Provider + auth.** Implement `CrawlerProvider` (and `CrawlerAuthProvider` if the site
   needs login) in the relevant domain module (e.g. `real-estate/providers/<site>/`). Pick a
   unique `siteKey`. Providers return generic `RawCrawlItem[]`.
2. **Register.** Add them to the domain module's `providers`, then register the provider (and
   a sink for its `siteKey`) in the domain's `*.registration.ts` — the engine never imports
   provider code.
3. **Seed a target.** Add a default in the domain's `*.bootstrap.service.ts` (idempotent —
   keyed by `siteKey`) so the dashboard shows it out of the box:

   ```ts
   {
     siteKey: 'acme',
     name: 'Acme listings',
     baseUrl: 'https://acme.example',
     startPath: '/listings',
     status: CrawlTargetStatus.NOT_CONFIGURED, // or READY if no config needed
     requiresAuth: false,
   }
   ```

4. **Schema + sink.** If the site is real-estate, reuse `RealEstateAdvertisementEntity` and
   the existing `RealEstateSink` (register it for your `siteKey`). For a different vertical,
   create a **new domain module** with its own entity + `CrawlResultSink` (+ optional
   `ExtractionPipeline`, see [extraction-pipelines.md](./extraction-pipelines.md)) rather than
   overloading the table. New entities auto-migrate on startup (`MigrationService`).

## Frontend

The dashboard is **data-driven** — it lists whatever targets the API returns, so a new
target appears automatically with status pills, login (if `requiresAuth`), run, and an ads
link. No per-site UI is required.

Only touch the frontend if the site needs bespoke config UI or a vertical-specific ad card
(then extend `apps/pwa/src/app/dashboard/crawler/`).

## Config

- Add any site-specific secrets to the root and `apps/core-api` `.env.example` (documented,
  not committed) and read them via `ConfigService`.
- If the site needs the browser, ensure `CAMOFOX_BASE_URL` is set — see
  [browser-gateway-camofox.md](./browser-gateway-camofox.md).

## Verify

`build` + `lint` both apps, start the API (target seeds + migrates), then exercise the flow:
optional login → enqueue job → ads appear in `/dashboard/crawler/ads`.
