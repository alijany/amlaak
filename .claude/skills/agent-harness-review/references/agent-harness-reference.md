# Agent harness audit reference

Use this framework to evaluate the repository's agent-facing structure neutrally. It is not
an instruction to simplify, expand, remove, reorganize, or rewrite the current setup.

## Objective

Make the right information discoverable at the right time, express real constraints at the
strongest appropriate layer, and change the harness only when evidence indicates that doing
so should improve agent behavior.

Preserve the null hypothesis: the current structure may already be appropriate.

## Evaluation questions

- What must always be known, and what is needed only for a particular task?
- Is each fact owned in one durable place and routed from a cheap entry point?
- Is guidance correct, specific enough to change a decision, and consistent with code?
- Can an invariant be verified mechanically instead of relying on prose?
- Did the current organization cause observable failure or material friction?
- Would the proposed change improve an observable outcome without adding larger costs?

## Evidence weight

Prefer repeated incorrect outcomes, validation failures, invariant violations, unnecessary
changes, and human corrections. Repeated friction with the same recurrence key is stronger
than isolated hesitation. Search paths and task traces are useful supporting evidence.

Treat a single agent's explanation of its own difficulty, hypothetical confusion, aesthetic
preference, and token-count estimates without outcome evidence as weak evidence. Recent
events are not automatically important. Successful comparable tasks are counterevidence.

## Change threshold

A permanent change should normally have:

1. an observed problem or measurable opportunity;
2. supporting evidence and a plausible causal relationship;
3. a minimal intervention at the correct ownership layer;
4. an expected observable benefit;
5. a way to detect regression.

Prefer no change for isolated, low-impact, low-confidence events. Do not add an instruction,
skill, checklist, or duplicate document merely because one can be imagined.

Before recommending a wording change, check whether it presupposes a solution,
overemphasizes a rare failure, turns a preference into a requirement, encourages unnecessary
work, or promotes a local rule to global scope. Where model variance matters, do not draw a
conclusion from one run.

## Intervention guide

- Missing or stale durable fact → update its owning product, engine, state, app, or developer
  document.
- Correct fact is hard to locate → improve the nearest routing index or link.
- Short rule applies to nearly every task → use the nearest applicable `AGENTS.md`.
- Conditional multi-step procedure → use or refine a skill.
- Deterministic invariant → enforce it in types, schemas, tests, lint, CI, or code when
  practical.
- Irrelevant context loads repeatedly with measurable cost → narrow its trigger or move
  conditional detail behind a reference.
- Evidence does not support a harness cause → record `no harness issue` and make no change.

Evaluate the harness and model behavior together when evidence permits; do not attribute an
execution anomaly to repository context merely because the context could be different.
