# Vision & Objectives

## Mission

Nava Amlak turns aggregated real-estate supply into **inbound leads** and gives agents the
tools to convert those leads into transactions — then grows into a public marketplace where
end users publish and manage their own listings.

## Phase 1 — Lead-generation platform (MVP)

The aggregation engine already exists (see [`crawler/`](./crawler/README.md)). Phase 1 turns
it into a lead engine:

1. **Aggregate** listings from external sources (Divar first, more later). ✅ built
2. **Publish** listings automatically to the public website and a Telegram channel.
3. **Promote** selected high-quality listings manually via Instagram / social media.
4. **Track** inbound calls and inquiries **per listing** (a dedicated tracking ID / phone
   number) so the originating property is known immediately.
5. **Manage leads** — agents follow up on inquiries and drive lead → transaction conversion.

Every Phase-1 decision must keep the door open to the marketplace below (clean domain
boundaries, standardized APIs, RBAC-driven access).

## Long-term — Public marketplace

- Public registration & onboarding for end users.
- User-generated listings + self-service publishing and management.
- Direct interaction between owners, agents, and prospects in one ecosystem.
- Growth in users, listings, traffic, channels, and CRM depth without re-architecting.

## User types

Roles already exist in [`apps/pwa/src/components/auth/auth.constants.roles.ts`](../apps/pwa/src/components/auth/auth.constants.roles.ts)
(`admin` 5 → `guest` 0, hierarchical; a user may hold one role per organization). Phase-1
mapping:

| Actor | Today's role | Does |
|---|---|---|
| Platform admin | `admin` | Configures crawl targets/schedules, manages users, oversees everything. |
| Marketing team | `manager`/`admin` | Selects listings to promote, runs social campaigns. |
| Agent | `member`/`manager` | Owns assigned leads, follows up, converts. |
| Future public user | `user` | (Marketplace) registers, publishes & manages own listings. |
| Visitor | `guest` | Browses public listings, generates inquiries. |

> The role set is a hierarchy, not the final org model — new business roles can be added
> without touching the guard/decorator machinery.

## Glossary

| Term | Meaning |
|---|---|
| **Listing / Advertisement** | A normalized property record. Entity: `RealEstateAdvertisementEntity` ([`real-estate/advertisement.entity.ts`](../apps/core-api/src/real-estate/advertisement.entity.ts)). |
| **Target** | A registered external site to crawl (e.g. Divar). `CrawlTargetEntity`. |
| **Crawl Job** | One scraping run against a target (full/incremental/single), BullMQ-backed. |
| **Lead / Inquiry** | An inbound contact (call/message) attributed to a specific listing. *Not yet modeled — M1.* |
| **Tracking ID** | The per-listing identifier (dedicated phone/code) used to attribute an inquiry to its source listing. *M1.* |
| **Agent** | The user who owns and follows up a lead. |
| **Channel** | A distribution/notification surface (website, Telegram, SMS, social). Notification channels exist; distribution to web/Telegram is M2. |
