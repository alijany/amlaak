# Status — Living Task Board

> Single source of truth for "what's next". **Update this file whenever a unit of work lands.**
> Status keys: ✅ `done` · 🔄 `in-progress` · ⬜ `todo`. Last updated: 2026-06-23.

## Current focus

Phase 1 milestones **M1–M4** are **built** (lead tracking, distribution/publishing, agency
multi-tenancy, and the self-service marketplace), the app is **rebranded to Nava Amlak**, and
a **B2C polish pass (P0)** has landed. All verified by lint + build. Next: **live e2e against a
DB**, and the B2C P1/P2 backlog (see below).

## Agency storefront, identity & uploads

- ✅ Generic image upload: `POST /storage/uploads` (auth, S3) + a reusable `ImageUploader`
  (`apps/pwa/src/components/upload/`) wrapping the `FilePicker` atom + `uploadFileFetcher`.
- ✅ Agency identity: `banner/website/city/address` added to `AgencyEntity` + DTOs + public
  shape; create + profile-edit forms now have logo/banner uploaders + website/city/address.
- ✅ Listing form now **uploads images** (was pasted URLs).
- ✅ Public agency **storefront** (`/agencies/[slug]`): banner + logo + about + city/address +
  website + phone CTA + listing count + ads, with **JSON-LD `RealEstateAgent`** for SEO
  (full SSR `generateMetadata` still backlog).
- ✅ Redirect-aware login: `RoleProtectedRoute` now sends guests to
  `/login?redirect=<intended>`; landing agencies CTA → `/dashboard/agency`.

## B2C product review & polish

A PM review of the customer-facing flows produced a prioritized backlog (full text in
`/root/.claude/plans/...` plan file). **P0 applied:**
- ✅ **Landing fully redesigned** (seeker-first, image-forward search hero): rebuilt
  `app/page.tsx` from the SaaS template into a marketplace home — hero with category tabs +
  location search + popular-city chips + live listing count; browse-by-category cards; live
  "جدیدترین آگهی‌ها" + "فروش ملک" strips (`usePublicListings` + `ListingCard`); seeker value
  props; 3-step how-it-works; a dedicated **agencies** band; trimmed FAQ. Sections live in
  `apps/pwa/src/components/landing/`; content in `brand.config.ts` (`landing` schema reshaped).
- ✅ **Public navbar matched to the landing**: scroll-aware (transparent white-text over the
  hero → solid white on scroll), marketplace nav links (خانه/آگهی‌ها/خرید/رهن و اجاره/سوالات),
  CTAs «ثبت آگهی» + «ورود» / «پنل کاربری». Authored **SVG skyline** hero background
  (`public/images/hero-home.svg`), swappable for a photo via `brand.config` `hero.backgroundImage`.
- ✅ Login modal stale «هم‌اوا» fixed; **role-aware post-login redirect** (staff → `/dashboard`,
  customers → `/listings`)
- ✅ Listing-detail contact routes to the **owning agency** (public shape exposes agency
  name/phone/slug; falls back to the brand phone) + links to the agency profile

**B2C backlog (not yet done):**
- ⬜ **P1 — Web inquiry → tracked Lead** (online "request callback" creating a `source=website`
  lead by tracking code) — highest-ROI conversion gap
- ⬜ P1 — Discovery upgrade (price/rooms/area filters, sort, buy/rent tabs); SSR + SEO/OG for
  public pages; funnel analytics
- ⬜ P2 — favorites/saved searches, share, agency enrichment, similar listings, map (`lat/lng`),
  report listing, OTP cooldown, profile-completion onboarding

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

## M3 — Agency & multi-tenancy foundation

- ✅ `agency` backend module (`apps/core-api/src/agency/`): `AgencyEntity`, agency-scoped
  roles (`agency` FK on `RolesEntity`, reusing OWNER/MANAGER/MEMBER), members
  invite/list/remove, agency profile CRUD — registered in `app.module.ts`
- ✅ Active-agency resolution: `x-agency-id` header (`@CurrentAgencyId`) + `AgencyAccessService`
  (platform ADMIN = cross-tenant); fetcher attaches it from `selected-agency`
- ✅ Hard multi-tenant scoping: `agency` FK on leads, lead pools, advertisements; `LeadService`
  scopes everything by active agency; crawled listings owned by the seeded **platform agency**
- ✅ `AgencyBootstrapService`: seeds the platform agency + backfills legacy null-agency rows
- ✅ Frontend: agency/role switcher shows agency name; `/dashboard/agency` (profile + members);
  `RoleType.agency` wired from `/auth/profile` (jwt strategy populates `roles.agency`)
- ⬜ Live e2e against a DB (tenant isolation, member invite, switcher → header → scoped data)

## M4 — Public marketplace (self-service)

- ✅ Self-service listings: `AdvertisementSource` (crawler/user) + nullable target/externalId
  + `createdBy`; `POST/GET/PATCH/DELETE /real-estate/listings` (agency-scoped, approve-first);
  `/dashboard/listings` ("آگهی‌های من") create/edit/delete with status pills
- ✅ Onboarding: `POST /agencies` (any user becomes OWNER); a "create agency" form on
  `/dashboard/agency` when the user has none
- ✅ Public agency storefront: `GET /public/agencies/:slug` (agency + published listings) +
  `/agencies/[slug]` page; `agencyId` filter on the public catalog
- ⬜ Live e2e against a DB (create listing → approve → appears on public site + agency profile)
- ⬜ Listing image upload (currently image URLs pasted; reuse S3 upload like profile picture)

## Rebrand — Nava Amlak

- ✅ `apps/pwa/src/config/brand.config.ts` rewritten (نوا املاک / Nava Amlak, real-estate copy)
  — landing/nav/footer all read from it; root `README.md` + `.env.example` header updated
- ⬜ `CLAUDE.md` still describes the generic boilerplate (left as the dev guide)

## Cross-cutting TODOs

- ✅ **Rebrand** "مونو / Monno" → **Nava Amlak** (brand.config + README + .env.example);
  `CLAUDE.md` intentionally left as the generic boilerplate dev guide
- ⬜ Review/moderation + dedupe of collected ads (also in
  [`crawler/roadmap.md`](./crawler/roadmap.md) backlog)
- ⬜ Stabilize test harness (currently `lint` + `build` is the verification loop)

## How to update

Move an item's box to ✅/🔄, add new items under the right milestone, and refresh the
"Current focus" line + "Last updated" date. Keep entries one line each, path-anchored.
