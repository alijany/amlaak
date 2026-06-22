# Product Roadmap

Product **milestones** for Nava Amlak, ordered by dependency. These sit *above* the crawler
**phases** (1–7, already done through Phase 5 — see [`crawler/roadmap.md`](./crawler/roadmap.md)),
which provide the ingestion layer everything else reuses. Each milestone names what already
exists, what's missing, and what to reuse so a new contributor can start without re-discovery.

## Gap snapshot (vision vs. current state)

| Phase-1 objective | Exists today | Missing | Reuse |
|---|---|---|---|
| Aggregate listings | ✅ crawler engine + Divar/Mock | more sources (later) | [`crawler/developer/adding-a-website-integration.md`](./crawler/developer/adding-a-website-integration.md) |
| Publish to website + Telegram | ❌ | distribution module, public pages, Telegram publisher | notification **Telegram channel**, `Advertisement` store |
| Promote on social | partial (manual) | "promote" flag + attribution | `Advertisement` + a status field |
| Track inquiries per listing | ❌ | Lead domain + tracking ID/phone | ORM base, `LEAD_ASSIGNED` notification template |
| Agents manage leads | ❌ | lead assignment/follow-up + dashboard | RBAC roles, dashboard layout |
| Marketplace foundation | partial (RBAC/org) | user-generated listings path | `Advertisement` + ownership fields |

## M1 — Lead generation & tracking MVP

The core of Phase 1: make every listing attributable and actionable.

- **Lead/inquiry domain** — new NestJS module `apps/core-api/src/lead/` following the
  standard module pattern (entity/controller/service/dtos). `Lead` links to a
  `RealEstateAdvertisementEntity`, carries source/channel + tracking ID, status
  (new → contacted → qualified → won/lost), and an assigned agent.
  - Reuse: ORM base classes [`apps/core-api/src/libs/orm/`](../apps/core-api/src/libs/orm);
    the `LEAD_ASSIGNED` notification template already stubbed in
    [`apps/core-api/src/notification/`](../apps/core-api/src/notification).
- **Per-listing tracking mechanism** — a dedicated tracking ID (and/or phone number) per
  promoted listing so an inbound call/message resolves to its listing.
- **Dashboard home** — implement the empty
  [`apps/pwa/src/app/dashboard/page.tsx`](../apps/pwa/src/app/dashboard/page.tsx) with an
  overview (listing counts, recent ads, crawl/job status, lead funnel) reusing the crawler
  APIs and `DataView`. Add a `leads` domain under `apps/pwa/src/app/dashboard/leads/`.

## M2 — Distribution & promotion

Get listings in front of prospects and attribute the inbound.

- **Auto-publish** new/approved listings to the **public website** and a **Telegram channel**
  (reuse the notification Telegram channel; add a publishing/distribution service that
  consumes the `Advertisement` store).
- **Promote workflow** — mark selected high-quality listings as promoted; feed the marketing
  team's social posts; attribute resulting inquiries back to the listing (ties into M1
  tracking).
- **Public listing pages** — first public-facing read surface (also a stepping stone to M3).

## M3 — Public marketplace

Open the platform to end users.

- Public registration/onboarding; user-generated listings (extend `Advertisement` with
  ownership + `source = user` instead of crawler); self-service publish/manage; multi-org
  workflows.
- Reuse: existing RBAC/org scaffolding and the `Advertisement` model — no re-architecture.

## Extensibility note

New domains follow the established seams: backend = isolated NestJS module registered in
`app.module.ts`; ingestion stays decoupled via the crawler **sink/registry** seam
([`crawler/architecture/overview.md`](./crawler/architecture/overview.md)); frontend = a
self-contained domain under `src/app/<domain>/`. Match the patterns in
[`apps/core-api/AGENTS.md`](../apps/core-api/AGENTS.md) and
[`apps/pwa/AGENTS.md`](../apps/pwa/AGENTS.md).
