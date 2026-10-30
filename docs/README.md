# Project documentation

Agent-facing entry point for this project's documentation. Use this file to choose the
smallest useful working set; it is not a project history.

## Current position

No product direction is recorded yet. When a project starts from this boilerplate, replace
this paragraph with the dated, currently approved direction in a few sentences: what is
built, what is approved but not built, and which state file tracks each area.

## Read only what the task needs

Always read the repository `AGENTS.md`, then the nearest app guide. Add documents from this
table; do not preload the entire docs tree.

When an approved or in-progress brief exists, its row overrides the domain rows below:
read the queue and brief first, then only the additional sources the brief names.

| Task | Start with | Add only when needed |
|---|---|---|
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

Only `tasks/` and `agent-friction-log.md` exist from the start. Create the others when the
project first has a fact they own, and add a routing row above when you do.

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
