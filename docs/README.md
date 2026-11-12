# Navamelk — Project Documentation

Agent-facing entry point for this project's documentation. Use this file to choose the
smallest useful working set; it is not a project history.

## Current position

**Navamelk (نوا ملک)** is a real-estate **lead-generation** platform. It aggregates
property listings from external sources (Divar first), publishes them to a website and
Telegram, lets the marketing team promote selected listings on social media, and tracks
inbound inquiries per listing so agents can follow up and convert leads. It is built to
evolve into a public, multi-user **marketplace** where end users publish and manage their
own listings.

> **Current focus (Phase 1):** turn the already-built aggregation engine into a lead engine —
> add lead/inquiry tracking, automate web + Telegram distribution, and fill the empty
> dashboard home. See [`status.md`](./status.md) for what's next.

### Product documents

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

### Current-state map (what's built and where)

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

## Read only what the task needs

Always read the repository `AGENTS.md`, then the nearest app guide. Add documents from this
table; do not preload the entire docs tree.

When an approved or in-progress brief exists, its row overrides the domain rows below:
read the queue and brief first, then only the additional sources the brief names.

| Task | Start with | Add only when needed |
|---|---|---|
| Product status, next unit of work | `status.md` | `vision.md`, `roadmap.md` |
| Crawler / aggregation engine | `crawler/README.md` | The architecture or lifecycle doc it names |
| Approved or in-progress hand-off | `tasks/README.md` for the queue and backlog, then the brief | Only the app/code/docs paths named by the brief |
| Starting or handing off a session | The matching skill below | The active brief, if one exists |
| Reviewing recurring agent friction or agent-facing structure | `agent-harness-review` skill | `agent-friction-log.md` and only the evidence named there |

Add a domain row when the project creates a state, product, or engine document for a
capability, naming the cheapest entry point first.

If a task is local and the code plus app guide answer it, stop there. State files are
indexes into current work, not mandatory reading for every edit.

## How work is handed to an agent

Each way of working is a skill in `.claude/skills/`, invoked by name. The skill owns the
procedure; this table is only the map.

| Situation | Skill |
|---|---|
| Implement, resume, or start the next approved task | `/task` |
| Diagnose and fix broken behavior | `/fix` |
| Turn an approved decision or finding into a hand-off | `/write-brief` |
| Audit or redesign a user-facing surface | `/design-ux-ui-copy` |
| Create, modify, or review search-facing public pages | `/seo` |

Planning is conversational until the user approves it. After approval, `/write-brief`
creates the durable hand-off; `/task` executes it. `/task` also owns "continue" and "start
the next ready brief": those are source-selection modes, not different implementation
procedures. Asking "what is next?" is read-only unless the user also says to start it.

Resolve working context in this order:

1. An explicit user-named brief or task.
2. The queue and active brief for "next" or "continue".
3. The nearest app guide and relevant code.
4. A state file when current status, priority, or a blocker matters.
5. An engine document only when the brief names it or a durable contract or decision is in
   question.

No skill or brief should restate `AGENTS.md`: `CLAUDE.md` imports it before the first tool
call. The skills are plain Markdown — for a tool that does not read `.claude/skills/`,
point it at the relevant `SKILL.md`.

## Document ownership

`tasks/` and `agent-friction-log.md` exist from the start. Create
the others when the project first has a fact they own, and add a routing row above when you
do.

| Path | Owns |
|---|---|
| `README.md` | Current direction, routing, and documentation rules |
| `<area>-state.md` | Current status, next executable work, blockers, costly gotchas for one area |
| `product/overview.md` | Stable strategy, invariants, glossary |
| `product/mvp.md` | Authoritative scope, backlog IDs, phases, gates, live product questions |
| `engine/` | Durable architecture and decisions of record; one capability per file |
| `tasks/` | Atomic briefs for approved work; `README.md` alone owns queue and backlog state and `_TEMPLATE.md` owns the format |
| `.claude/skills/` (repo root) | Procedures: design, SEO, brief authoring, task execution, bug fixing, and agent-harness review |
| `agent-friction-log.md` | Significant observed execution friction; evidence, not an improvement backlog |
| `discovery/` | Research that informs a decision but is not current scope |
| `archive/` | Superseded provenance; never a planning source |

Canonical documents are English; localized text belongs in UI strings. User instructions
and the current code win over stale prose; fix material conflicts in the owning document as
part of the task.

## Keep the system small

After a task lands, update documentation by ownership:

1. Update the state file only when status, the next step, a blocker, or a costly gotcha
   changed.
2. Update an engine document only for a durable contract or decision. Describe the final
   behavior and rationale; do not append a chronological implementation diary.
3. Update the product scope document only when scope, priority, a gate, or a stable backlog
   item's status changed.
4. Delete a completed task brief and its queue row only after every acceptance criterion is
   complete. If work remains, keep or split the brief; never delete a partly completed scope.
5. Link to the owning fact instead of copying it. Prefer section names to line numbers,
   which drift immediately. Never restate what `AGENTS.md` already says — `CLAUDE.md`
   imports it, so it is in every agent's context before the first tool call.
6. Put a workflow correction where it is enforced: a universal rule in `AGENTS.md`, a
   hand-off rule in `tasks/_TEMPLATE.md`, or a procedure in the owning skill. Do not create
   a separate workflow diary.

Before adding a new document, ask whether an existing state, product, engine, or app guide
already owns the fact. Create a task brief only when work is approved and needs a durable
cold-session hand-off; execute routine local work directly. Do not create meeting-note
branches, per-task completion reports, or duplicate “current status” sections.

When a state or engine file becomes hard to scan, replace closed-work narration with a
short outcome plus links to code and the owning decision. Preserve only evidence that
changes future implementation or verification.
