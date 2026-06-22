# Status — Living Task Board

> Single source of truth for "what's next". **Update this file whenever a unit of work lands.**
> Status keys: ✅ `done` · 🔄 `in-progress` · ⬜ `todo`. Last updated: 2026-06-22.

## Current focus

Phase 1 → **M1 (lead tracking)** and **M2 (distribution: approve-first publishing +
Telegram + public site)** are **built** (verified by lint + build). Next: live e2e against a
DB + a real Telegram bot/channel, then **M3 (public marketplace)**.

## Foundation (already built)

- ✅ Auth (OTP + JWT/refresh), users, RBAC roles
- ✅ Notifications (SMS / Email / Telegram / push) — Telegram channel ready
- ✅ Storage (S3/MinIO/Arvan), SMS gateway
- ✅ Crawler engine + real-estate domain (Divar + Mock, normalization, image→S3, jobs, cron,
  sessions) — crawler phases 1–5 done ([`crawler/roadmap.md`](./crawler/roadmap.md))
- ✅ Dashboard: crawler management + crawled-ads list/detail
- ✅ Project documentation foundation (this `docs/` layer)

## M1 — Lead generation & tracking MVP

- ✅ `lead` backend module (`apps/core-api/src/lead/`): `LeadEntity` ↔ advertisement,
  `LeadPoolEntity` (shared pools), status pipeline, source, agent assignment + self-claim,
  role-scoped visibility — registered in `app.module.ts`
- ✅ Per-listing tracking code (software-only): `lead.tracking.ts` (`NV-`+base36(adId)) +
  `GET /leads/lookup?code=` resolver; mirrored on the frontend
  (`apps/pwa/src/libs/lead/lead.util.tracking.ts`) and shown on the crawled-ad detail page
- ✅ `LEAD_ASSIGNED` notification fired on assignment (`LeadService.notifyAssigned`)
- ✅ Dashboard home (`apps/pwa/src/app/dashboard/page.tsx`): KPIs, lead funnel, recent listings
- ✅ Frontend `leads` domain (`apps/pwa/src/app/dashboard/leads/`): list + filters + create
  modal + detail (status/claim/assign/notes) + pools page; nav entry added (sidebar + mobile)
- ✅ Extracted shared `StatusPill` atom (`apps/pwa/src/ui/atoms/ui.status-pill.tsx`) reused by
  crawler + leads
- ⬜ Live e2e against a DB (create/assign/claim/stats/lookup) — not run in this session (no DB)
- ⬜ Agent-list source for managers without `/users` read access (assign uses `useUsers` today)

## M2 — Distribution & promotion

- ✅ Approve-first publishing: `PublishStatus` (pending/published/rejected) on the
  advertisement entity; `ListingModerationService.approve/reject`; dashboard
  `PATCH /real-estate/advertisements/:id/publish|reject` (managers+) with Approve/Reject UI +
  status pill + publish-status filter on the crawled-ads views
- ✅ Telegram channel publisher (`real-estate/publishing/telegram-listing.publisher.ts`):
  posts photo+caption on approval; config-driven (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHANNEL_ID`/
  `PUBLIC_WEB_URL` in `.env.example`), no-ops when unset
- ✅ Public website: `GET /public/listings` + `/public/listings/:id` (published-only, trimmed
  public shape — source contact stripped); public `/listings` index + `/listings/[id]` detail
  with contact CTA + tracking code; "آگهی‌ها" link in the public navbar
- ⬜ Live e2e against a DB + real bot/channel (approve → published + Telegram post + public visibility)
- ⬜ Promote/featured workflow (deferred — out of scope this milestone)

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
