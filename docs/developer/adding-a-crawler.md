# Adding a Crawler (Provider)

A "crawler" is a `CrawlerProvider` implementation for one site. This guide adds a provider
to an **existing** module. (Adding a brand-new website end-to-end — target seed, dashboard,
env — is covered in [adding-a-website-integration.md](./adding-a-website-integration.md);
this is the core piece of that.)

## 1. Implement `CrawlerProvider`

Create `apps/core-api/src/crawler/providers/<site>/<site>.crawler.provider.ts`:

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

  async crawl(ctx: CrawlContext): Promise<RawAdvertisement[]> {
    // 1. (if requiresAuth) use ctx.session
    // 2. fetch/snapshot listing pages from ctx.baseUrl, up to ctx.maxItems
    // 3. map each listing to RawAdvertisement (externalId is required + stable)
    return [];
  }
}
```

**Rules of thumb**
- Keep providers free of NestJS HTTP/DB concerns — in, a `CrawlContext`; out,
  `RawAdvertisement[]`.
- `externalId` must be stable per listing (it's half the upsert key).
- Put loose values in `attributes`; the pipeline normalizes them. Keep the source payload in
  `raw`.
- Honor `ctx.maxItems` and any politeness config.

Use `providers/mock/mock.crawler.provider.ts` as a complete reference.

## 2. Add an auth provider (if `requiresAuth`)

See [authentication-providers.md](./authentication-providers.md). If the site needs no
login, you can still return a no-op provider, but prefer setting `requiresAuth: false`.

## 3. Register it

In `crawler.module.ts` add the class to `providers`, then inject it into
`CrawlerProviderRegistry` and `register()` it:

```ts
// crawler-provider.registry.ts
constructor(mock: MockCrawlerProvider, divar: DivarCrawlerProvider, acme: AcmeCrawlerProvider) {
  this.register(mock);
  this.register(divar);
  this.register(acme);
}
```

## 4. Create a target row

Either add it to `CrawlerBootstrapService` defaults or `POST /crawler/targets` with a
`siteKey` matching `metadata.siteKey`.

## 5. Verify

`pnpm --filter core-api build && pnpm --filter core-api lint`, start the API, enqueue a job
(`POST /crawler/targets/:id/jobs`) and confirm ads appear via `GET /crawler/advertisements`.
