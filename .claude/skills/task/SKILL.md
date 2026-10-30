---
name: task
description: Implement approved work in this repository end to end from an explicit task brief, a user-named task, an in-progress queued brief, or the next ready brief when the user explicitly says to start it. Also use to resume approved work. Do not use for bug reports, unapproved planning, or a read-only question such as "what is next?".
---

# Implement an approved task

Treat a task brief as the execution scope and `docs/tasks/README.md` as the sole source of
queue state. Do not create a second plan inside a decision-complete brief.

## Select the source

1. If the user names a brief, read it.
2. For "continue", inspect the current conversation and working-tree diff, then resume the
   matching `in-progress` brief. If no brief is active, use the user-named state-doc item or
   ask which approved work they mean; do not infer a deferred item from an engine doc.
3. When explicitly told to **start** the next task, read `docs/tasks/README.md` and choose
   the top non-conflicting `ready` brief **from the Queue**. Mark it `in-progress` after the
   scope-integrity check passes and before editing code. Never select from the Backlog: if
   the Queue holds nothing claimable, report that and ask which backlog brief to promote.
4. For a direct approved task with no brief, read the nearest app guide and relevant code.
   Use `docs/README.md` to add only a state, product, or engine section needed to settle a
   current fact or durable contract.

If the user only asks what is next, report the top ready Queue candidate and blockers
without claiming or implementing it. When the Queue is empty, say so and name the backlog
briefs available for promotion.

## Check scope integrity before code

Read the nearest app guide and the files named by the brief. Verify the brief against the
current code and user instruction; user instruction and code win over stale prose.

Stop before implementation when the brief is contradictory, contains a choice that changes
the prescribed behavior, or cannot be completed as one quality change. Recommend the exact
correction or split. Do not silently implement a smaller subset of the brief.

For a direct task without a brief, state a compact scope and continue when it fits. If it
does not fit, propose atomic slices and wait for approval before `/write-brief` records them.

## Design from the existing system

- Name and follow the closest existing code precedent.
- Trace the lifecycle of every field or state changed: all writers, readers, later
  overwrites, and externally visible consequences.
- State material risks and assumptions.
- Check an engine decision only when the change could contradict a durable recorded
  contract; do not load an engine doc as a default task tracker.

After understanding that flow, choose the first option below that fully satisfies the
approved behavior:

1. No implementation change because the behavior already exists or a current configuration
   or composition change covers it.
2. Reuse or extend an existing repository implementation or pattern.
3. Use the language or runtime standard library.
4. Use a native framework, browser, database, or platform capability.
5. Use an already-installed dependency.
6. Write the minimum custom code needed.

Stop at the first sufficient option; do not evaluate every rung as a research exercise. The
ladder chooses how to implement the approved scope, not whether to omit it. Never simplify
away acceptance criteria, trust-boundary validation, security, accessibility, data-loss
protection, localization, or required error handling.

## Implement and verify

Implement the complete approved scope without speculative preparation or unrelated cleanup.
Clear the brief's observable verification bar by executing or rendering, never by reading
the diff alone. Follow `AGENTS.md` for app-scoped lint, safe runtime validation, and the ban
on irreversible outward verification.

## Close the task

Update documentation only when its owned fact changed:

- durable contract or rationale → owning engine section;
- milestone status, blocker, or next step → state file;
- product scope, priority, or gate → product doc.

Do not add routine implementation or completion narration. For a fully completed brief,
delete the brief and its queue row together without replacing them with a completion note
in the queue. If any acceptance criterion remains, keep it `in-progress` or replace it with
approved successor briefs; never discard unfinished scope.

Report changed files, verification performed, remaining scope, and any unresolved risk.
