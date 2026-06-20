# Crawler Platform Documentation

This directory documents the **AI-friendly crawling infrastructure** introduced as a
foundation for a multi-site crawling platform. The first target is Divar real-estate
(`https://divar.ir/s/gilan-province/real-estate`), but the architecture is site-agnostic.

> **Status: Phase 3 — Divar implemented.** The crawler is split into a generic **engine**
> (`core-api/src/crawler/`) and a **real-estate** domain module (`core-api/src/real-estate/`)
> that uses it. The `CamofoxBrowserGateway` is validated against a live Camoufox sidecar, and
> the **Divar** real-estate crawler works end-to-end against the live site (close map →
> infinite scroll → per-ad detail enrichment → normalize → persist). See [roadmap.md](./roadmap.md).

## How the docs are organized

### Architecture
- [overview.md](./architecture/overview.md) — components, module map, key abstractions
- [crawler-lifecycle.md](./architecture/crawler-lifecycle.md) — target → job → provider → pipeline → store
- [authentication-lifecycle.md](./architecture/authentication-lifecycle.md) — interactive OTP state machine
- [data-flow.md](./architecture/data-flow.md) — raw → normalized → persisted → dashboard
- [scaling-strategy.md](./architecture/scaling-strategy.md) — queues, proxies, multi-site, multi-worker

### Developer guides
- [adding-a-crawler.md](./developer/adding-a-crawler.md)
- [adding-a-website-integration.md](./developer/adding-a-website-integration.md)
- [authentication-providers.md](./developer/authentication-providers.md)
- [extraction-pipelines.md](./developer/extraction-pipelines.md)
- [browser-gateway-camofox.md](./developer/browser-gateway-camofox.md)

### Roadmap
- [roadmap.md](./roadmap.md) — recommended implementation path for future phases

## TL;DR for the impatient

- Generic engine: [`apps/core-api/src/crawler/`](../apps/core-api/src/crawler)
- Real-estate domain (entity, providers, Divar): [`apps/core-api/src/real-estate/`](../apps/core-api/src/real-estate)
- Frontend dashboard: [`apps/pwa/src/app/dashboard/crawler/`](../apps/pwa/src/app/dashboard/crawler)
- Both the **Mock** and **Divar** targets work end-to-end today (enqueue a job → see ads in
  the dashboard). Divar drives a real Camoufox browser; Mock needs no browser.
