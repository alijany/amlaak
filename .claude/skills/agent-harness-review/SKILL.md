---
name: agent-harness-review
description: Audit this repository's agent instructions, skills, routing, and recorded friction to decide whether a small evidence-backed harness change is justified. Use for an explicit harness review or investigation of recurring agent friction. Do not use during routine implementation or after a single ordinary difficulty.
---

# Review the agent harness

Evaluate the agent-facing system against repository evidence. Do not assume improvement is
necessary; `No harness change is currently justified` is a successful result.

Optimize for reliable task outcomes and timely discovery of relevant context—not fewer
files, fewer tokens, more documentation, or structural elegance in isolation.

## Ground the review

Read [references/agent-harness-reference.md](references/agent-harness-reference.md), then
`docs/agent-friction-log.md`. Map only the part of the harness implicated by the review:
root and nearest `AGENTS.md` files, relevant skills, `docs/README.md` routing, validation or
CI enforcement, and the code or history cited by friction entries.

Use progressive discovery. Do not load the whole documentation tree or treat self-reported
friction as an established cause.

## Review

1. Separate observations from interpretations. Confirm that each material event occurred
   and identify its concrete impact.
2. Challenge the claim: was the needed information correct, available, and reasonably
   discoverable; did conflicting guidance exist; could normal exploration explain it; has
   the behavior recurred?
3. Search for counterevidence, including similar successful tasks, correct skill routing,
   existing mechanical enforcement, and documents with genuinely distinct ownership.
4. Classify supported patterns as a knowledge gap, discovery gap, workflow gap, trigger
   gap, consistency gap, enforcement gap, context-cost issue, staleness issue, or no
   harness issue. State confidence in any causal conclusion.
5. Recommend a permanent intervention only when severity, recurrence, causal confidence,
   expected benefit, maintenance cost, and regression risk justify it. A severe one-off may
   qualify when the failure is costly and the cause is clear.
6. Choose the strongest appropriate layer: code/test/lint for mechanically enforceable
   invariants; the owning document for durable knowledge; `AGENTS.md` for short universal
   rules; a skill for conditional procedures; routing changes for discoverability.

Prefer the smallest intervention. Do not edit the harness during a read-only review unless
the user explicitly asks for implementation. Do not convert observations automatically
into task briefs or product backlog items.

## Report

Provide:

- a concise structural map;
- verified observations and counterevidence;
- findings with confidence and evidence;
- counterevidence and explicit no-change findings;
- `no change` or the smallest proposed intervention;
- the layer choice, risk, observable benefit, and regression check for each proposed change;
- experiments for uncertain proposals rather than immediate permanent changes;
- uncertainties and evidence still needed.

Update reviewed friction entries' status when the review is authorized to edit the
repository. Preserve observations even when their hypotheses are rejected.

When implementation is requested, preserve each file's existing ownership and validate any
changed skill with the available skill validator.
