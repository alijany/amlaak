# Status — Living Task Board

> Single source of truth for "what's next". **Update this file whenever a unit of work lands.**
> Status keys: ✅ `done` · 🔄 `in-progress` · ⬜ `todo`. Last updated: 2026-06-22.

## Current focus

Phase 1 → **M1 (Lead generation & tracking)**. The aggregation engine is live; the next unit
of work is modeling leads/inquiries and filling the dashboard home. No M1 code has started yet.

## Foundation (already built)

- ✅ Auth (OTP + JWT/refresh), users, RBAC roles
- ✅ Notifications (SMS / Email / Telegram / push) — Telegram channel ready
- ✅ Storage (S3/MinIO/Arvan), SMS gateway
- ✅ Crawler engine + real-estate domain (Divar + Mock, normalization, image→S3, jobs, cron,
  sessions) — crawler phases 1–5 done ([`crawler/roadmap.md`](./crawler/roadmap.md))
- ✅ Dashboard: crawler management + crawled-ads list/detail
- ✅ Project documentation foundation (this `docs/` layer)

## M1 — Lead generation & tracking MVP

- ⬜ `lead` backend module (`apps/core-api/src/lead/`): `Lead` entity ↔ advertisement,
  tracking ID, status pipeline, agent assignment — register in `app.module.ts`
- ⬜ Per-listing tracking mechanism (dedicated phone/code → listing attribution)
- ⬜ Wire `LEAD_ASSIGNED` notification template to lead assignment
- ⬜ Dashboard home page — implement empty
  [`apps/pwa/src/app/dashboard/page.tsx`](../apps/pwa/src/app/dashboard/page.tsx) (overview
  widgets, lead funnel)
- ⬜ Frontend `leads` domain (`apps/pwa/src/app/dashboard/leads/`) — list + detail + assignment

## M2 — Distribution & promotion

- ⬜ Distribution service: auto-publish listings to public website
- ⬜ Telegram channel publisher (reuse notification Telegram channel)
- ⬜ "Promote" workflow + inbound attribution
- ⬜ Public listing pages

## M3 — Public marketplace

- ⬜ Public registration/onboarding
- ⬜ User-generated listings (extend `Advertisement` with ownership + `source`)
- ⬜ Self-service listing management; multi-org workflows

## Cross-cutting TODOs

- ⬜ **Rebrand** example brand "مونو / Monno" → **Nava Amlak**:
  [`apps/pwa/src/config/brand.config.ts`](../apps/pwa/src/config/brand.config.ts) plus
  landing/nav/footer in [`apps/pwa/src/components/layout/`](../apps/pwa/src/components/layout),
  and root [`README.md`](../README.md) / [`CLAUDE.md`](../CLAUDE.md)
- ⬜ Review/moderation + dedupe of collected ads (also in
  [`crawler/roadmap.md`](./crawler/roadmap.md) backlog)
- ⬜ Stabilize test harness (currently `lint` + `build` is the verification loop)

## How to update

Move an item's box to ✅/🔄, add new items under the right milestone, and refresh the
"Current focus" line + "Last updated" date. Keep entries one line each, path-anchored.
