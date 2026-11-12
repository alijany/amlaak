# Agent friction log

This log records significant repository-induced friction observed during agent work. It is
an observation log, not a backlog and not evidence by itself that instructions, skills, or
documentation should change.

Add an entry only when friction materially affected execution—for example, it caused wrong
behavior, failed verification, a substantial avoidable search, a retry, an invariant
violation, or human intervention. Do not record routine uncertainty that normal exploration
resolved.

The executing agent records observable facts and impact, not a proposed harness fix. Review
accumulated entries with the `agent-harness-review` skill. A review may conclude that no
change is justified. Repeated successful work is counterevidence and should be considered.

## Entry template

Copy this section below `## Entries`. Use the date and a sequence number for the ID.

```md
### FR-YYYYMMDD-001 — Short task name

- Observed friction: What happened, without assigning a cause.
- Impact: `low | medium | high` — Concrete execution cost.
- Evidence: Relevant files, conflicting text, failed command, retry, or user correction.
- Suspected cause: Optional falsifiable hypothesis, or `unknown`.
- Confidence: `low | medium | high`.
- Related artifacts: Agent instructions, skills, docs, checks, or code involved.
- Expected path: What the agent reasonably needed to find or do.
- Actual path: What happened instead.
- Recurrence key: Stable phrase for grouping materially similar events, or `unknown`.
- Resolution during task: What allowed work to continue, or `unresolved`.
- Potential follow-up: Optional evidence to collect; do not prescribe a permanent change.
- Task outcome: `succeeded | partially succeeded | failed`.
- Status: `observed | reviewed | experiment-created | resolved | accepted-risk`.
```

Do not include secrets, credentials, private user data, full transcripts, speculative root
causes, or an instruction change proposal.

Record symptoms before explanations and keep hypotheses falsifiable. During review, group
entries by recurrence key rather than recency, preserve successful counterexamples, and
update status instead of deleting history when a hypothesis is rejected.

## Entries

No entries yet.
