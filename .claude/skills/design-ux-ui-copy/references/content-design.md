# Content Design & UX Writing Workflow

For microcopy, interface states, labels, terminology, voice and tone, landing-page messaging, and Persian/RTL copy. Load [ux-design.md](ux-design.md) if the request also changes journey structure, decisions, inputs, or behavior.

## Establish the job of every string

For each text, identify:

- location and state;
- the user's immediate question, concern, or decision at that moment;
- its functional job: orient, explain, help decide, prompt action, set expectation, establish justified trust, confirm, or help recover;
- current copy (read it from the source or i18n file — don't work from memory of what it probably says);
- proposed copy;
- a one-line rationale tied to an observed problem.

If a string has no job, delete it. And don't use copy to cover a structural or capability gap — better wording on a broken step just makes the failure harder to diagnose later.

## Writing rules

- Use the user's vocabulary, in plain language. Their words, not the internal system's.
- Front-load the important information; make headings and blocks scannable, since most people don't read interfaces so much as scan them for the next decision.
- One main idea per block.
- Concise but complete. Brevity that removes necessary context isn't concision, it's a bug.
- One term per concept, product-wide. If the same thing is a "workspace" here and a "project" there, users assume they're different things.
- Name the consequence in action labels. `OK`, `Submit`, `Continue`, and `Learn more` are placeholders — replace them when a specific label exists.
- State prerequisites, cost, commitment, and irreversibility *before* the action, not in the confirmation after it.
- Keep voice consistent; adapt tone to context. Calm and direct for payments, privacy, destructive actions, failures.
- Never invent benefits, capabilities, proof, numbers, guarantees, testimonials, scarcity, or urgency. Mark unsupported claims `[NEEDS PROOF]`.
- No dark patterns, no blaming the user, no ambiguity engineered to push a choice.

## Interface states

Write only the states the product actually supports.

| State | What the copy must do | Weak | Better |
|---|---|---|---|
| Button | name the action or destination, make the consequence predictable | `Submit` | `Send invite` |
| Hint | supply what's needed before input; never restate the label | `Enter your email` | `We'll send the receipt here` |
| Validation | name the exact issue and the expected format | `Invalid input` | `Use a date in the future` |
| Error | what happened, in user terms; what's still safe; how to recover | `Error 500` | `We couldn't save your changes. They're still here — try again.` |
| Empty | explain the state and the most useful next action | `Nothing here yet!` | `No invoices yet. New invoices appear here once you bill a client.` |
| Loading | set an expectation, but only when duration or the next state matters | spinner + `Loading...` | `Checking availability — about 10 seconds` |
| Success | what completed, its consequence, the next relevant action | `Done!` | `Invite sent to sam@acme.com. They have 7 days to accept.` |
| Destructive | name the object, consequence, reversibility, and the safe alternative | `Are you sure?` | `Delete "Q3 Report"? This can't be undone. You can archive it instead.` |

Errors deserve extra care: don't joke, don't leak raw technical language, don't blame the user, and never clear input they entered correctly. An error state is where trust is either kept or lost.

## Website and landing-page messaging

Settle the message hierarchy before writing final copy — polished sentences in the wrong order still fail:

1. audience and their context
2. the problem or the progress they want
3. the specific outcome you promise
4. the mechanism, or what makes this different
5. proof, placed next to the claim it supports
6. objections, cost, risk, and commitment — before the decision point
7. primary CTA, labeled by action and consequence

Test it: can a target visitor quickly tell who this is for, what it helps them do, why this product specifically, and what happens after they click? Prefer specific and objective over hype. Don't dump objections into an FAQ at the bottom; put each one where the doubt actually occurs.

## Persian and RTL copy

Persian interface copy fails most often by being English with Persian words in it. Write it natively.

- Write Persian, don't translate. If a sentence only parses because you can reconstruct the English behind it, rewrite it.
- Keep terminology, نیم‌فاصله, punctuation, numerals (۱۲۳ vs 123 — pick one and hold it), and formality level consistent across the product. Mixed formality reads as sloppiness.
- Prefer the term users actually say over the internal or needlessly English product term.
- Terminology decisions are product-wide. Flag them rather than varying a term in one screen.
- Check the rendered result for text expansion, wrapping, mixed RTL/LTR strings, embedded numbers, URLs, and input examples. Persian strings commonly run longer than the English they replaced, and a mixed-direction string can render in an order you didn't intend — this is only visible when rendered.
- Read it aloud. Constructions that sound bureaucratic or translated are the ones to fix.

## Diagnose before rewriting

- Unclear wording → copy fix
- Wrong order or missing prerequisite → content hierarchy fix
- Too many decisions or inputs → this is a UX problem; report it and load `ux-design.md`
- Missing capability → report the product gap; don't promise it in copy
- Trust concern with no evidence → ask for proof; don't manufacture reassurance

For consequential rewrites, present the content audit, preserved terminology, message hierarchy, `[NEEDS PROOF]` items, and open decisions before the final copy.

## Validate

Check whether users can predict what an action does; identify cost, commitment, and risk; recover from errors unaided; understand the page from headings alone; tell claims apart from proof; and — for Persian — read it naturally without mentally reconstructing an English sentence.

Recommend comprehension testing, first-click testing, scenario walkthrough, cloze testing, or behavioral measurement. Untested copy isn't validated copy.
