# Browser Gateway (Camoufox)

Providers that need a real browser depend on the `BrowserGateway` interface
(`browser/browser-gateway.interface.ts`), **not** on any concrete browser. The shipped
implementation, `CamofoxBrowserGateway`, is an HTTP client for the Camoufox stealth-browser
sidecar.

> **Status:** validated (Phase 2). `CamofoxBrowserGateway` has been exercised against a live
> camofox-browser **v1.11.x** sidecar — the request/response mapping, bearer auth, health
> wiring, and retry/timeout handling below reflect the real API. The Mock provider never
> touches the browser, so the platform still runs without Camoufox.

## What is Camoufox?

[`@askjo/camofox-browser`](https://github.com/jo-inc/camofox-browser) is a stealth headless
browser (Firefox with C++-level fingerprint spoofing) exposed as a **REST server** (default
port `9377`). It's designed to bypass bot detection and is a drop-in alternative to
Playwright/Puppeteer for AI agents. Key traits:

- **Accessibility snapshots** with stable element refs (`e1`, `e2`, …) — far smaller than
  raw HTML and ideal for LLM-driven extraction.
- **Proxy support** (residential / back-connect) via env.
- **Persistent profiles / cookies** for durable sessions.

## Running the sidecar

```bash
npx @askjo/camofox-browser            # serves http://localhost:9377
# or Docker (see the upstream repo)
```

Then configure the API:

```
CAMOFOX_BASE_URL=http://localhost:9377   # http://camofox:9377 in docker-compose
CAMOFOX_API_KEY=...                      # required by some endpoints (cookies/sessions)
# optional proxying, read by the sidecar itself:
PROXY_HOST= PROXY_PORT= PROXY_USERNAME= PROXY_PASSWORD= PROXY_STRATEGY=backconnect
```

A commented `camofox` service block is included in `docker-compose.yml` and
`.devcontainer/docker-compose.yml` — uncomment to run it alongside the stack.

## The interface

```ts
interface BrowserGateway {
  isAvailable(): Promise<boolean>;
  health(): Promise<BrowserHealth>;            // structured availability for the dashboard
  createTab(opts: { sessionId; url? }): Promise<BrowserTab>;
  navigate(tabId, url): Promise<void>;
  snapshot(tabId): Promise<PageSnapshot>;      // accessibility text + refs
  click(tabId, ref): Promise<void>;
  type(tabId, ref, text): Promise<void>;
  importCookies(sessionId, cookies): Promise<void>;
  exportCookies(sessionId): Promise<BrowserCookie[]>;  // see "Cookies" below
  closeTab(tabId): Promise<void>;
}
```

`sessionId` maps to Camoufox's `userId`/profile, so cookies and tabs are scoped per target
(`target-<id>`).

## REST mapping (CamofoxBrowserGateway)

Camoufox scopes **every tab operation** to the owning `userId`. The interface only passes a
`tabId`, so the gateway keeps an internal `tabId → sessionId` map (populated in `createTab`,
cleared in `closeTab`) and injects `userId` on each call.

| Gateway method | Camoufox endpoint | Notes |
|---|---|---|
| `health` / `isAvailable` | `GET /health` | `{ ok, engine, browserConnected, activeTabs, activeSessions }` |
| `createTab` | `POST /tabs` `{ userId, sessionKey, url }` | returns `{ tabId, url }` (mapped to `BrowserTab.id`) |
| `navigate` | `POST /tabs/:id/navigate` `{ userId, url }` | |
| `snapshot` | `GET /tabs/:id/snapshot?userId=` | returns `{ url, snapshot, refsCount }`; `snapshot` is **text** |
| `click` | `POST /tabs/:id/click` `{ userId, ref }` | |
| `type` | `POST /tabs/:id/type` `{ userId, ref, text }` | |
| `importCookies` | `POST /sessions/:userId/cookies` | **bearer** auth (`Authorization: Bearer $CAMOFOX_API_KEY`) |
| `closeTab` | `DELETE /tabs/:id?userId=` | |

### Snapshots are text

`PageSnapshot.text` carries Camoufox's compact accessibility tree (indented, with inline refs
like `- link "Learn more" [e1]`), not a JSON node tree — it's the natural input for LLM-driven
extraction (Phase 6). `PageSnapshot.tree` is reserved for a future parser and is not populated.

### Cookies / sessions

Cookie **import** is bearer-gated. There is **no cookie-export endpoint** — Camoufox persists
profiles/cookies server-side per `userId` (the persistence plugin, backed by the `browser-data`
volume). `exportCookies()` therefore throws a `BrowserGatewayError`; durable session
export/reconciliation against `CrawlSessionEntity` is **Phase 4**.

### Reliability

All sidecar calls go through one helper that applies a timeout, bearer auth, and
**transient-failure retries** with exponential backoff (network errors, 5xx, 429, timeouts).
Failures are mapped to a typed `BrowserGatewayError` (`operation`, `status`, `transient`).
Tunables: `CAMOFOX_TIMEOUT_MS`, `CAMOFOX_MAX_RETRIES`, `CAMOFOX_RETRY_DELAY_MS`,
`CAMOFOX_HEALTH_TIMEOUT_MS`.

Browser availability is surfaced on the dashboard via `GET /crawler/targets/browser`
(→ `gateway.health()`) and a status pill in the crawler page header.

## Swapping the backend

To use a different browser (e.g. in-process Playwright) implement `BrowserGateway` and
change one line in `crawler.module.ts`:

```ts
{ provide: BROWSER_GATEWAY, useClass: MyOtherBrowserGateway }
```

No provider code changes.
