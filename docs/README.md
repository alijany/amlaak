# Crawler Platform Documentation

This directory documents the **AI-friendly crawling infrastructure** introduced as a
foundation for a multi-site crawling platform. The first target is Divar real-estate
(`https://divar.ir/s/gilan-province/real-estate`), but the architecture is site-agnostic.

> **Status: Phase 2 — Real browser integration.** Architecture, interfaces, workflows and
> developer tooling are in place, and the `CamofoxBrowserGateway` is validated against a live
> Camoufox sidecar (health wiring, retries/timeouts, dashboard availability). The real Divar
> crawler is still *scaffolded* (mock-backed) — see Phase 3 in [roadmap.md](./roadmap.md).

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

- Backend module: [`apps/core-api/src/crawler/`](../apps/core-api/src/crawler)
- Frontend dashboard: [`apps/pwa/src/app/dashboard/crawler/`](../apps/pwa/src/app/dashboard/crawler)
- A **Mock** target works end-to-end today (enqueue a job → see ads in the dashboard).
- A **Divar** target is registered but its provider/auth throw `NotImplemented` until a
  real browser environment is wired up.
