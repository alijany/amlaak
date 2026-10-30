---
name: write-brief
description: Convert approved work—an accepted plan, audit finding, founder decision, or state-doc next step—into atomic agent-ready briefs and queue rows under docs/tasks/. Use when the user asks for a durable implementation hand-off or approved task breakdown. Do not use for exploratory planning, unapproved findings, implementation, or routine small edits that need no hand-off.
---

# Write an executable task brief

Write a brief only when work is approved and needs a cold-session hand-off. If the request
is still exploratory, present the plan for review without writing into `docs/tasks/`. If the
work is small enough to execute safely from the user request, app guide, and code, recommend
using `/task` directly instead of creating another artifact.

## Ground the hand-off

Read:

1. `docs/tasks/README.md` for queue and backlog state and the lifecycle;
2. `docs/tasks/_TEMPLATE.md` for the format;
3. the approved source artifact and nearest relevant code/app guide;
4. only the state, product, or engine section needed to verify current status, scope, or a
   durable decision.

Do not require an engine doc when the code, app guide, and approved source settle the task.
Name the closest existing code precedent in the brief.

## Convert findings without confusing evidence and scope

Triage each approved finding:

- copy or presentation defect → include when it belongs to the same user outcome;
- bounded structural defect with a known answer → brief material;
- unresolved product choice → record a recommended decision and mark the brief `blocked`;
- unapproved capability or scope gap → route it to the owning product/state decision surface,
  not into an executable brief.

Group by coherent user outcome, implementation coupling, and reviewability—not merely by
severity or shared filenames. A brief must be one complete, demoable change that one agent
can verify in a quality pass. Record a queue collision only when concurrent work edits the
same component, symbol, migration, or semantic region; distinct translation keys alone are
not a collision.

## Make ready mean executable

A `ready` brief must:

- prescribe one complete behavior with no implementation-gating choice;
- carry only task-specific context, evidence, invariants, and exclusions;
- name exact code precedents and relevant paths;
- state observable task-specific verification;
- identify documentation destinations conditionally by ownership;
- omit generic execution prompts and rules already loaded from `AGENTS.md` or the app guide.

When a decision changes the prescribed behavior, create or keep the brief as `blocked`, put
one recommended answer in its Decisions and blockers section, and name the blocker in the
queue. Change it to `ready` only after recording the decision in the brief.

## Publish the hand-off

Create each brief from `_TEMPLATE.md` and add exactly one row for it in
`docs/tasks/README.md`, with status, dependency, and true collision information. Put the row
in the **Queue** when the user is scheduling the work now, and in the **Backlog** when the
work is approved but deferred; ask which when the approval did not settle it. Those tables
alone own task status; do not duplicate status or owner in the brief.

Report the resulting order, blockers, and any approved input that became no brief and where
it was routed. Do not implement the work in the same session.
