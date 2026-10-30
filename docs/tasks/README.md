# Task briefs

Self-contained hand-offs for **approved work**. A brief exists so an agent can start cold,
finish one reviewable change, and leave durable documentation correct. It is deleted only
when its full acceptance bar is complete, so an unfinished brief remains the hand-off for
the next session.

`_TEMPLATE.md` is the format and is never deleted.

## Stable task names

Use `NNN-short-user-outcome.md`, for example `007-invite-members.md`. The numeric prefix
is the permanent task ID, not its priority. Keep the writing/revision dates inside the
brief; moving a row does not rename its file. Never recycle a closed task ID.

**Next task ID: 001.** Allocate it here when publishing a new brief, then advance this
counter. Historical closed IDs need no placeholder file or completion row.

Two tables own task state. The **Queue** is scheduled work an agent may claim now; the
**Backlog** is approved work that is written but deliberately not scheduled. A brief file
lives in this directory either way — only its row moves.

## Queue

Ordered by pick-up value. This table alone owns claimable task state; do not duplicate
status or owner inside briefs.

- `ready` — approved, decision-complete, and safe to claim.
- `in-progress` — claimed by a session; other agents must not start it.
- `blocked` — not executable; `Blocked on` names the missing decision or dependency.

"Conflicts with" means concurrent work would edit the same component, symbol, or semantic
region. Merely touching the same translation file is not a conflict when keys are distinct.

| # | Brief | Status | Blocked on | Conflicts with |
|---|---|---|---|---|

When closing work, delete its queue row without replacing it with a completion summary.
Record only changed durable facts in their owning engine, state, or product document; Git
history preserves the queue's chronology.

Several independent ready rows may proceed if their semantic regions do not collide.
`ready` authorizes implementation, not a real customer send, production data change, or
deployment; any such operational authorization belongs to the brief.

## Backlog

Approved briefs that are not scheduled. A backlog row is **not claimable**: an agent told to
"start the next task" reads the Queue only, and stops to ask when the Queue is empty rather
than promoting a row on its own judgement.

`Readiness` describes the brief, not its schedule:

- `decision-complete` — nothing unresolved; promoting it makes it `ready`.
- `blocked` — `Blocked on` names the missing decision or dependency; resolve that first.

To promote, the user schedules the work: move the row into the Queue with the matching
status, then claim it as usual. To park scheduled work, move its row back here unchanged —
never delete a brief that still has unfinished scope.

| # | Brief | Readiness | Blocked on | Parked because |
|---|---|---|---|---|

## The loop

1. **Approve, then write.** Planning and audits remain review artifacts until the user
   approves a coherent change. `/write-brief` then creates an atomic brief from
   `_TEMPLATE.md` and adds its row — to the Queue when the work is being scheduled now, to
   the Backlog when it is approved but deferred.
2. **Select and check scope integrity.** `/task` selects an explicit brief, the existing
   `in-progress` brief for "continue", or the top `ready` **Queue** brief when explicitly
   told to start the next task. A Backlog row is never selected this way; if the Queue holds
   nothing claimable, report that and ask which backlog brief to promote. The brief is
   already the slice. If it is contradictory, decision-incomplete, or too large for one
   quality pass, stop and propose a split or correction before implementation; do not
   silently choose a smaller subset.
3. **Claim.** After the integrity check passes, change a ready row to `in-progress` before
   editing code.
4. **Implement and verify the whole brief.** Its verification bar must be cleared by
   executing or rendering, not paraphrased from the diff.
5. **Update durable facts conditionally.** Update an engine doc only for a changed durable
   contract or decision, a state file only for changed status/blocker/next step, and product
   docs only for changed scope or priority. Do not record routine implementation history.
6. **Close atomically.** Delete the completed brief and its row together; do not
   replace either with completion narration. If any acceptance criterion remains, keep the
   brief `in-progress`, park it back in the Backlog, or replace it with approved successor
   briefs; never discard unfinished scope.

## What a brief owes its agent

- **Never restate what is already in context.** `CLAUDE.md` imports `AGENTS.md`, so every
  agent starts with the commands, the devcontainer and login flow, the verification rules
  and the cross-cutting invariants already loaded. Restating them wastes context and
  creates a second copy to go stale. Name paths and section titles instead.
- **Name the precedent, not the pattern.** "Follow `dashboard/users/page.tsx` for the
  filtered list" replaces *understand the codebase* with *read one file*. This is the
  single highest-leverage line in any brief.
- **Say what not to read**, and what not to build. The deferred table is the anti-scope-creep
  device: naming what to leave alone, with reasons, is what stops an agent improving things
  it was not asked to touch.
- **Be decision-complete when ready.** A `ready` brief contains no question that changes
  its prescribed behavior. Put unresolved decisions in the brief with a recommendation and
  mark its row `blocked`; move it to `ready` only after recording the answer.
- **State the bar as observable behavior.** "Zero day cells in the DOM 600ms after the
  click" can be proven; "works correctly" cannot.
- **Name true collisions.** Record shared components, symbols, migrations, or semantic
  regions. Do not serialize otherwise independent work merely because both add translation
  keys or update a broad index.
