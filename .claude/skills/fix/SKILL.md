---
name: fix
description: Diagnose and fix broken or incorrect behavior in this repository with root-cause evidence, a minimal coherent change, and regression verification. Use when the user reports a bug, failure, regression, or behavior that does not match expectations. Do not use for new features or an already-approved task brief.
---

# Fix broken behavior

## Diagnose before editing

Read the nearest app guide, reproduce or trace the reported behavior, and identify the root
cause rather than its symptom. State the diagnosis, evidence, and confidence before changing
code.

Check `docs/tasks/README.md` for an active or ready brief covering the same behavior. If one
exists, avoid a competing partial implementation: identify the overlap and either execute
the approved brief through `/task` or agree on a narrower urgent fix first.

Read an engine section only when the expected behavior is ambiguous or the proposed fix may
contradict a durable decision. Do not use engine docs as a bug log. When reproduction needs
missing state, stub it and follow `AGENTS.md`'s ban on irreversible outward verification.

## Fix the root cause

Once the root cause and affected callers are known, choose the first option below that fully
restores the expected behavior:

1. No code change because correcting current configuration, data, or composition removes the
   cause.
2. Reuse or correct the shared repository implementation through which the affected paths
   already flow.
3. Use the language or runtime standard library.
4. Use a native framework, browser, database, or platform capability.
5. Use an already-installed dependency.
6. Write the minimum custom code needed at the root-cause location.

Stop at the first sufficient option; do not turn the ladder into a research exercise. Prefer
one correction at the shared cause over patches at individual symptoms, but do not force a
new shared abstraction where none exists. Never simplify away trust-boundary validation,
security, accessibility, data-loss protection, or required error handling.

Make the resulting smallest coherent change without refactoring, renaming, or cleaning up
unrelated code on the way past. Stop and propose the approach before editing when the fix
changes a product contract, crosses a meaningful system boundary, or has uncertain blast
radius.

## Verify and document conditionally

Reproduce the original path end to end and check the closest regression surface by executing
or rendering. Run the owning app's normal verification from `AGENTS.md`.

Update project documentation only when the bug exposed a false durable fact, changed a
contract, changed milestone status, or created approved future work. Put approved larger
follow-up work through `/write-brief`; do not append root-cause or completion notes to an
engine doc by default.

Report the root cause, changed files, verification performed, and any bounded follow-up.
