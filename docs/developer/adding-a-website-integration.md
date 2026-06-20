# Adding a New Website Integration

End-to-end checklist for onboarding a new target site. Builds on
[adding-a-crawler.md](./adding-a-crawler.md) (the provider) and
[authentication-providers.md](./authentication-providers.md) (the auth, if needed).

## Backend

1. **Provider + auth.** Implement `CrawlerProvider` (and `CrawlerAuthProvider` if the site
   needs login). Pick a unique `siteKey`.
2. **Register.** Add both to `crawler.module.ts` `providers` and wire them into
   `CrawlerProviderRegistry`.
3. **Seed a target.** Add a default in `CrawlerBootstrapService` (idempotent — keyed by
   `siteKey`) so the dashboard shows it out of the box:

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

4. **Schema.** If the site is real-estate, reuse `RealEstateAdvertisementEntity`. For a
   different vertical, add a sibling entity + a dedicated `ExtractionPipeline` (see
   [extraction-pipelines.md](./extraction-pipelines.md)) rather than overloading the table.
   New entities auto-migrate on startup (`MigrationService`).

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
