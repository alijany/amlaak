# Real-estate module — agent testing & crawling notes

High-signal facts for developing/testing the crawler. The engine lives in
[`../crawler/`](../crawler); this module owns advertisements + the Mock/Divar providers.
See also [`../../../../docs/`](../../../../docs) for architecture/roadmap.

## Run a crawl end-to-end (no UI)

API base: `http://localhost:4000/api/v1`. All crawler/real-estate routes are **admin-guarded**.

**Getting an admin token:** the dashboard OTP *user-login* is broken in dev
(`auth.service.ts` `sendOtp` throws "A text for parsing must be a string"). Mint a JWT directly
instead — the strategy just loads the user by `sub`:

```bash
# admin user id = 2 (phone +989358883585); divar target = 2, mock target = 1
JWT_SECRET=$(grep -E '^JWT_SECRET=' apps/core-api/.env | cut -d= -f2- | tr -d "'\"")
node -e "const jwt=require('./node_modules/.pnpm/jsonwebtoken@9.0.3/node_modules/jsonwebtoken');\
console.log(jwt.sign({sub:'2',username:'+989358883585',isAdmin:true},process.env.JWT_SECRET,{expiresIn:'30m'}))" \
  JWT_SECRET="$JWT_SECRET"   # pass as env, not arg
```

Then: `curl -H "Authorization: Bearer $TOKEN" ...`

```
POST /crawler/targets/2/jobs   {"type":"full_scan","maxItems":3}   # enqueue
GET  /crawler/jobs?targetId=2&limit=1                              # poll status+stats
GET  /real-estate/advertisements?targetId=2&limit=5               # see results
GET  /crawler/targets/browser                                     # camofox health
```

Keep `maxItems` small (2–3) when iterating: each ad opens its detail page (~3–4s) + image
downloads. A 3-ad Divar crawl takes ~40–50s.

## Camoufox browser gateway — quirks (validated v1.11.x)

Sidecar at `http://camofox:9377` (`CAMOFOX_*` env). Direct probing is the fastest way to learn
the live site before coding (`curl`):

- **Every tab op needs `userId`** (createTab/navigate/click/type/snapshot/scroll/close). The
  gateway tracks `tabId → sessionId` internally; raw curl must pass it.
- `POST /tabs` needs `{userId, sessionKey, url}` and returns `tabId` (not `id`).
- `GET /tabs/:id/snapshot?userId=` → `{url, snapshot, refsCount}`; **`snapshot` is text**
  (indented ARIA tree with `[eN]` refs), not JSON. Refs are **per-snapshot** — match elements
  by accessible name/role at runtime, never hard-code `eN`.
- **Do NOT use `/wait` as a sleep** — without a CSS selector it blocks on network-idle, which
  never settles on Divar → 30s timeout. The providers use in-process `sleep()` for pacing.
- Cookie import is **bearer-gated**; there is **no cookie export**. Profiles/cookies persist
  server-side per `userId` (persistence plugin + `browser-data` volume). `destroySession`
  (`DELETE /sessions/:userId`, bearer) clears them.
- `GET /tabs/:id/images?userId=` → `{images:[{src,width,height}]}` (used for ad photos).

## Divar (gilan-province real-estate) — live structure

Listing: `https://divar.ir/s/gilan-province/real-estate`

- **Close the map first** (desktop): click the `button "بستن نقشه"`; it toggles to "نمایش نقشه".
- **Infinite scroll** loads more cards (scroll down ~3000px, repeat). ~8 cards initially.
- **Ad cards**: each `article > link` has `/url: /v/<slug>/<token>`. The **`<token>` is the
  `externalId`** (e.g. `ga24MzEy`, `QanF5uKJ`). The link also has a `heading` (title) and a
  `text` line with price/meta.
- **Detail page** (`https://divar.ir/v/x/<token>`): clean spec table as `paragraph:<label>`
  then `paragraph:<value>` — labels map in [`providers/divar/divar.constants.ts`](providers/divar/divar.constants.ts)
  `DIVAR_SPEC_LABELS` (متراژ→area, قیمت ملک→totalPrice, قیمت هر متر→pricePerMeter, ودیعه→deposit,
  اجاره→rent، ...). Sale ad → has قیمت/totalPrice; rent ad → has ودیعه/اجاره.
- **Images**: served from `*.divarcdn.com`. Prefer the `/webp_post/` path (full photos) over
  `/webp_thumbnail/`. Files are `.webp`. Note: some hosts (e.g. `postimage01.divarcdn.com`) may
  be unreachable from this sandbox — image download then falls back to the source URL.
- Parsing/ref-finding helpers: [`providers/divar/divar.parser.ts`](providers/divar/divar.parser.ts)
  (`findRef`, `parseListingCards`, `parseDetailSpecs`). Persian digit/number parsing is in
  [`normalization.service.ts`](normalization.service.ts) via `normalizeNumbers`.

Sample tokens for quick detail/image probing: `ga24MzEy`, `gaDsUdlH`, `gayI1WK6`.

## Image storage

Downloaded images go to S3/MinIO (bucket `app-dev`) at
`crawler/<siteKey>/<externalId>/<n>.webp`; source URLs are kept in `attributes.sourceImages`.
Deterministic keys → re-crawl overwrites in place, and the sink **skips re-download** if the ad
already has stored images. Toggle with `CRAWLER_STORE_IMAGES=false`. Verify an object:
`curl -I http://minio:9000/app-dev/crawler/divar/<token>/0.webp`.

## Scheduling (admin)

`/crawler/schedules/:targetId` — `PUT` (upsert), `POST .../enable|disable|run`, `DELETE`. Cron
supports 6 fields (seconds) — use `*/20 * * * * *` for fast testing, then **disable/delete** so
it stops firing. Queue politeness: `CRAWL_QUEUE_MAX` / `CRAWL_QUEUE_DURATION_MS`; per-target
`crawlDelayMs` flows to the provider via job params.

## Mock target

`siteKey: mock` (target 1) needs no browser and is deterministic — use it to exercise the
queue → sink → persist → dashboard path without Camoufox.
