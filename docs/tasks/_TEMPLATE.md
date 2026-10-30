# Task — <verb-first user outcome>

Filename: `<stable NNN>-<short-user-outcome>.md`; allocate the ID from
`docs/tasks/README.md`. Keep it fixed when execution order changes.

**Written:** <YYYY-MM-DD> · **Product backlog:** <ID + owning product doc, or "none">
**Depends on:** <landed prerequisite, or "nothing">
**Source:** <approved audit finding, plan, founder decision, or state-doc next step>

This brief is one approved, reviewable change. `docs/tasks/README.md` alone owns whether it
is queued or in the backlog. A `ready`/`decision-complete` brief has no unresolved choice;
unresolved choices make it `blocked`.

## 0. Working set

**Read:** <nearest app guide, relevant code paths, and only the additional doc sections
needed for this task>. **Do not read:** <tempting but irrelevant areas>.

**Files and precedents.**

```text
<path>  <what it owns or why it is the closest existing precedent>
```

**Task-specific invariants.**

- <Only facts not already supplied by AGENTS.md or the app guide that would silently break
  this change if missed.>

## 1. Outcome

<One paragraph in the user's terms: what becomes possible or correct when this lands.>

## 2. Evidence and reason

<Carry only evidence needed to justify or correctly implement this scope. Label observed
behavior and hypotheses honestly; preserve useful measurements and cite the producing file,
symbol, or rendered state.>

## 3. Decided behavior

<Describe the complete behavior to build. Name existing precedents instead of reproducing
their implementation. A ready brief contains no alternatives for the implementer to choose.>

## 4. Scope

**In:**

- <One coherent, independently reviewable change.>
- <Exact modules, copy namespaces, migrations, or interfaces involved.>

**Out:**

| Deferred | Why it stays out |
|---|---|
| <adjacent work> | <one-line boundary or dependency> |

## 5. Decisions and blockers

For a ready brief: `None — this brief is decision-complete.`

For a blocked brief, list only decisions that change the prescribed behavior. Give one
recommendation per question and name the blocker in the queue. Record the answer here before
changing the queue status to `ready`.

## 6. Verification bar

State task-specific behavior that can be proved by executing or rendering. Name relevant
viewports, locales, states, API paths, and forbidden outward actions only where they differ
from or sharpen `AGENTS.md`.

- <Observable pass/fail statement.>
- <Observable adjacent regression check.>

## 7. Documentation impact

List only plausible durable updates. These are conditions, not mandatory completion notes.

| If this changes | Update |
|---|---|
| Durable behavior or rationale | <engine doc + exact section, or "none"> |
| Milestone status, blocker, or next step | <state doc + exact section, or "none"> |
| Product scope, priority, or gate | <product doc + exact section, or "none"> |

Do not write routine root-cause, implementation, or completion narration into project docs.
