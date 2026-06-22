# Adding a Crawler (Provider)

A "crawler" is a `CrawlerProvider` implementation for one site. Providers live in a **domain
module** (e.g. `real-estate`), not in the generic engine. This guide adds a provider to an
**existing** domain. (A brand-new website end-to-end — target seed, dashboard, env — is in
[adding-a-website-integration.md](./adding-a-website-integration.md); a non-real-estate
*vertical* additionally needs its own entity + `CrawlResultSink`.)

## 1. Implement `CrawlerProvider`

Create `apps/core-api/src/real-estate/providers/<site>/<site>.crawler.provider.ts`:

```ts
@Injectable()
export class AcmeCrawlerProvider implements CrawlerProvider {
  readonly metadata: ProviderMetadata = {
    siteKey: 'acme',
    displayName: 'Acme listings',
    requiresAuth: false,
    supportedJobTypes: [CrawlJobType.FULL_SCAN, CrawlJobType.INCREMENTAL],
  };

  constructor(
    @Inject(BROWSER_GATEWAY) private readonly browser: BrowserGateway, // if needed
    private readonly auth: AcmeAuthProvider,
  ) {}

  getAuthProvider(): CrawlerAuthProvider {
    return this.auth;
  }

  async crawl(ctx: CrawlContext): Promise<RawCrawlItem[]> {
    // 1. (if requiresAuth) use ctx.session
    // 2. fetch/snapshot listing pages from ctx.baseUrl, up to ctx.maxItems
    // 3. map each listing to a RawCrawlItem (stable externalId + a `data` bag)
    //    real-estate providers use toRawAdvertisement({ externalId, fields, ... })
    return [];
  }
}
```

**Rules of thumb**
- Keep providers free of NestJS HTTP/DB concerns — in, a `CrawlContext`; out,
  `RawCrawlItem[]`.
- `externalId` must be stable per listing (it's half the upsert key).
- Put loose values in `data` (for real-estate, inside `fields.attributes`); the sink's
  normalization step parses them. Keep the source payload in `raw`.
- Honor `ctx.maxItems` and any politeness config.

Use `providers/mock/mock.crawler.provider.ts` (simple) or `providers/divar/` (real browser,
close map → infinite scroll → detail enrichment) as references.

## 2. Add an auth provider (if `requiresAuth`)

See [authentication-providers.md](./authentication-providers.md). If the site needs no
login, set `requiresAuth: false`.

## 3. Register it

Providers are registered with the engine by the domain module, not imported by the engine.
Add the class to the domain module `providers`, then register it in
`real-estate.registration.ts` (which runs on `onModuleInit`):

```ts
for (const provider of [this.mock, this.divar, this.acme]) {
  this.providers.register(provider);
  this.sinks.register(provider.metadata.siteKey, this.sink); // reuse the domain sink
}
```

If your provider feeds a **different** domain, register its own `CrawlResultSink` for that
site key instead of the real-estate sink.

## 4. Create a target row

Either add it to the domain's `*.bootstrap.service.ts` defaults or `POST /crawler/targets`
with a `siteKey` matching `metadata.siteKey`.

## 5. Verify

`pnpm --filter core-api build && pnpm --filter core-api lint`, start the API, enqueue a job
(`POST /crawler/targets/:id/jobs`) and confirm records appear (real-estate:
`GET /real-estate/advertisements`).
