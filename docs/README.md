# Navamelk — Project Documentation

**Navamelk (نوا ملک)** is a real-estate **lead-generation** platform. It aggregates
property listings from external sources (Divar first), publishes them to a website and
Telegram, lets the marketing team promote selected listings on social media, and tracks
inbound inquiries per listing so agents can follow up and convert leads. It is built to
evolve into a public, multi-user **marketplace** where end users publish and manage their
own listings.

> **Current focus (Phase 1):** turn the already-built aggregation engine into a lead engine —
> add lead/inquiry tracking, automate web + Telegram distribution, and fill the empty
> dashboard home. See [`status.md`](./status.md) for what's next.

## Read this first (AI agents & new contributors)

1. **[`status.md`](./status.md)** — the living task board. *Start here* to see what's done,
   in progress, and the next unit of work.
2. **[`vision.md`](./vision.md)** — product vision, objectives, user roles, glossary.
3. **[`roadmap.md`](./roadmap.md)** — product milestones (M1–M3) with a per-objective gap
   analysis (what exists / what's missing / what to reuse).
4. **[`crawler/`](./crawler/README.md)** — the existing crawler/aggregation engine
   engineering docs (architecture, lifecycles, developer guides). Already built and live.

> **Terminology:** product **milestones** (M1–M3, this folder) are distinct from the crawler
> **phases** (1–7, in [`crawler/roadmap.md`](./crawler/roadmap.md)). The crawler is the
> ingestion layer the product is built on.

## Current-state map (what's built and where)

| Area | Status | Location |
|---|---|---|
| Auth (OTP + JWT, refresh) | ✅ | [`apps/core-api/src/auth/`](../apps/core-api/src/auth) |
| Users (individual/legal) | ✅ | [`apps/core-api/src/user/`](../apps/core-api/src/user) |
| RBAC roles + invitations | ✅ | [`apps/core-api/src/roles/`](../apps/core-api/src/roles) |
| Notifications (SMS / Email / **Telegram** / push) | ✅ | [`apps/core-api/src/notification/`](../apps/core-api/src/notification) |
| Storage (S3 / MinIO / Arvan) | ✅ | [`apps/core-api/src/storage/`](../apps/core-api/src/storage) |
| SMS gateway | ✅ | [`apps/core-api/src/sms/`](../apps/core-api/src/sms) |
| Crawler engine (targets, jobs, sessions, browser, scheduling) | ✅ | [`apps/core-api/src/crawler/`](../apps/core-api/src/crawler) |
| Real-estate domain (Advertisement, Divar + Mock providers, sink, normalization) | ✅ | [`apps/core-api/src/real-estate/`](../apps/core-api/src/real-estate) |
| ORM base classes (extend these) | ✅ | [`apps/core-api/src/libs/orm/`](../apps/core-api/src/libs/orm) |
| Frontend dashboard (crawler mgmt, crawled ads list/detail) | ✅ | [`apps/pwa/src/app/dashboard/`](../apps/pwa/src/app/dashboard) |
| Shared API layer (fetcher + SWR helpers) | ✅ | [`apps/pwa/src/libs/api/`](../apps/pwa/src/libs/api) |
| Async UI (`DataView`) | ✅ | [`apps/pwa/src/ui/molecules/`](../apps/pwa/src/ui/molecules) |
| Dashboard nav + role-filtered routes | ✅ | [`apps/pwa/src/components/dashboard/dashboard.constants.route-groups.tsx`](../apps/pwa/src/components/dashboard/dashboard.constants.route-groups.tsx) |
| Brand config (single source for site copy) | ✅ (example brand) | [`apps/pwa/src/config/brand.config.ts`](../apps/pwa/src/config/brand.config.ts) |
| **Lead / inquiry tracking** | ❌ todo (M1) | — |
| **Web + Telegram listing publishing** | ❌ todo (M2) | — |
| **Public listing pages** | ❌ todo (M3) | — |
| **Dashboard home** (`/dashboard`) | ❌ empty | [`apps/pwa/src/app/dashboard/page.tsx`](../apps/pwa/src/app/dashboard/page.tsx) |
| **Rebrand** (example "مونو/Monno" → Navamelk) | ❌ todo | [`apps/pwa/src/config/brand.config.ts`](../apps/pwa/src/config/brand.config.ts) |

## How to continue (conventions & verification)

- **Conventions:** repo guide [`CLAUDE.md`](../CLAUDE.md); per-app patterns in
  [`apps/core-api/AGENTS.md`](../apps/core-api/AGENTS.md) and
  [`apps/pwa/AGENTS.md`](../apps/pwa/AGENTS.md). Backend = one isolated NestJS module per
  feature; frontend = one self-contained domain per `src/app/<domain>/`.
- **Reuse, don't reinvent:** extend the ORM base classes, the notification channels, the
  crawler sink/registry seam, and the frontend fetcher/SWR helpers + `DataView`.
- **Verification loop:** `pnpm --filter core-api lint && build`, `pnpm --filter pwa lint &&
  build`. Tests (`pnpm test`) are currently unstable — use lint + build.
- **When you finish a unit of work, update [`status.md`](./status.md).**
