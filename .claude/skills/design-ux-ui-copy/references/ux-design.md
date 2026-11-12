# UX Design Workflow

For journey audits, information architecture, onboarding, forms, checkout, flow simplification, and usability diagnosis. Load [content-design.md](content-design.md) only if the request also involves wording, message hierarchy, or copy deliverables.

## Audit the journey

Map each step with:

- the user's immediate goal, and the question in their head at that moment;
- what they see, understand, decide, enter, and do;
- the system's response and what it sets them up to expect next;
- friction, risk, or uncertainty — with an evidence label.

The "question in their head" line does real work. Most journey defects are a mismatch between what the user is trying to find out at a step and what the screen chooses to tell them, and you won't see that mismatch if you only map what the screen contains.

Include only states the product actually supports: first-time, returning, loading, empty, permission, error, success, cancellation, destructive, undo, recovery. In a repo, find these by reading the component's conditional branches and its i18n keys rather than guessing which states exist.

## Test familiarity

- Name the pattern a user would expect here — from the platform, the product, or the domain.
- Check whether controls, placement, icons, terms, and consequences match that expectation.
- Treat every deviation as a cost that needs justification, not as a chance to be interesting.
- Use the same behavior for the same action everywhere in the journey. Inconsistency is more expensive than mediocrity, because it forces users to re-learn something they'd already learned.

## Prune without oversimplifying

For each step, field, choice, message, and action, ask: *what user need or system constraint requires this, here, now?* Then classify:

- `KEEP` — necessary at this moment
- `REMOVE` — serves no user or system job
- `MERGE` — duplicates another decision or message
- `AUTOMATE` — the system already knows this or can safely infer it
- `MOVE LATER` — needed, but not before commitment or comprehension
- `CLARIFY` — necessary but currently hard to understand

Worked example — a signup form with email, password, confirm password, full name, company, company size, referral source, and a newsletter checkbox:

- confirm password → `REMOVE` (a show-password toggle solves this better, and the field doubles the typing)
- company size, referral source → `MOVE LATER` (useful to the business, but they're asked before the user has any reason to invest)
- full name → `CLARIFY` or `MOVE LATER` depending on whether anything in the product displays it
- newsletter checkbox → `KEEP`, unchecked (pre-checking it is a dark pattern, not a growth tactic)

Don't optimize for fewer screens. A focused step can reduce total effort even while adding a page. And never hide cost, eligibility, commitment, risk, consent, consequences, or recovery in the name of simplicity — that's not simplification, it's concealment.

## Diagnose before redesigning

Match the intervention to the actual cause:

| Symptom | Cause | Intervention |
|---|---|---|
| Unclear term or instruction | Content | Copy fix — route to content-design.md |
| Right information, wrong order or missing context | Content hierarchy | Reorder, don't restructure |
| Too many decisions or inputs | Journey | Structural fix |
| The product can't do what the user needs | Capability | Report the product gap; don't design around it |
| User doesn't trust the step, and you have no proof | Evidence | Request proof; adding reassurance you can't back is how trust gets spent |

Before redesigning, present: ranked findings with labels and root causes; what's working and will be preserved; the pruning classifications; the smallest recommended scope; open product decisions each with a recommendation.

## Redesign the approved scope

- Map the proposed journey step by step: goal → information needed → decision or action → system response → next expectation.
- Link every changed step to a ranked finding. If a change can't be traced to a finding, it's taste — either label it or drop it.
- Name the familiar pattern you're reusing, and justify any deviation.
- Cover the relevant default, loading, empty, permission, error, success, cancellation, undo, destructive, and recovery states.
- State what you removed, merged, automated, moved, or clarified — and what risk that introduces. Every removal trades something; naming the trade is what makes it reviewable.
- Keep larger discoveries in a future-investigation list.

## Validate

Walk the journey as the users who apply: first-time, returning and fast, hesitant about risk or commitment, recovering from an error.

Check whether they can:

- predict what each action will do before doing it;
- finish without unnecessary decisions or re-entering information;
- see cost, commitment, eligibility, and risk *before* the point of no return;
- cancel, undo, or recover;
- stay in control while complexity is disclosed progressively.

Recommend a lean test — first-click, task-based usability, scenario walkthrough, or behavioral measurement — and name the specific observable behavior that would confirm or reject the design. An untested journey is not a validated one, and saying so protects the work from being over-trusted later.
