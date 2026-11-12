---
name: design-ux-ui-copy
description: Audit, redesign, and validate user-facing UX, UI, interface copy, website messaging, Persian/RTL content, and design-system decisions. Use for flow or usability reviews, screen and component redesigns, design QA, microcopy and state writing, landing-page messaging, localization-sensitive UX, or requests to simplify or polish an experience. Use for diagnosis and design; route approved repository implementation through the task workflow.
---

# UX, UI, and copy design

Design from the user's task outward: establish the structure and content before visual
treatment, prefer familiar product patterns, and judge implemented work in the rendered UI.

## Route only the needed craft reference

- Journey, information architecture, forms, onboarding, or usability diagnosis → read
  [references/ux-design.md](references/ux-design.md).
- Microcopy, terminology, interface states, website messaging, or Persian/RTL writing → read
  [references/content-design.md](references/content-design.md).
- Visual redesign, design language, new-screen composition, or design QA → read
  [references/ui-design.md](references/ui-design.md).
- Mixed work → use UX structure, then content, then visual UI. Load only the references the
  request actually needs.

For copy-only work, preserve the flow unless wording cannot solve an observed structural
problem; report that problem separately. For polish-only work, preserve behavior, content
meaning, component APIs, and product scope.

## Ground before proposing

Inspect the supplied brief, code, running surface, screenshots, existing strings, tokens,
components, research, and analytics that actually exist. In this repository, read the
nearest app guide and current UI before proposing a replacement. Ask only questions whose
answers materially change the result.

Restate the target user, immediate job, entry point, meaningful completion, business goal,
constraints, and source of truth. State assumptions where the evidence does not answer one.

## Apply the guardrails

1. Label consequential claims `[OBSERVED]`, `[EVIDENCE-BACKED]`, `[HYPOTHESIS]`, or
   `[PREFERENCE]`. Mark unsupported claims `[NEEDS PROOF]`; never invent users, research,
   capabilities, numbers, testimonials, scarcity, or urgency.
2. Prefer, in order: approved product decision; existing product patterns and components;
   established design language; native platform pattern; common domain convention.
3. Reduce decisions, repetition, context switching, input, and recovery cost—not screen
   count. Preserve steps needed for trust, consent, comprehension, confirmation, undo,
   recovery, and legal obligations.
4. Match the intervention to the cause: wording → copy; hierarchy → reorder; excess effort
   → structure; missing capability → product gap. Choose the smallest coherent solution.
5. Give every string a functional job and protect truthful, direct Persian and English
   copy. Check mixed RTL/LTR content in the rendered result.
6. Stop for approval before changing journey structure, required information, action logic,
   copy strategy, product behavior, component APIs, or visual direction unless the user has
   already approved that scope.

## Run the workflow

1. **Audit:** map only the relevant journey and real states, including failure and recovery.
   Tie findings to exact code, copy, or rendered behavior and name what already works.
2. **Diagnose:** rank the consequential findings by user effect, business effect, evidence
   strength, and cost of leaving them. Avoid numerical scores based on guesses.
3. **Scope:** recommend the smallest coherent change and real open decisions, with one
   recommendation each. Keep larger discoveries outside the current scope.
4. **Redesign:** map each change to a finding, reuse existing components and semantic
   tokens, and provide one recommended copy set unless a genuine decision remains.
5. **Implement only when requested and approved:** follow the repository `/task` lifecycle;
   do not create unrelated refactors or quietly change an approved brief.
6. **Validate:** render relevant viewports, locales, directions, and states. Check
   accessibility, keyboard/focus behavior, responsive layout, long content, localization,
   RTL, and reduced motion as applicable. Never call work user-validated without actual
   user evidence.

## Keep findings separate from execution scope

An audit persuades a decision-maker with evidence; a task brief instructs an agent with a
decided scope. Do not automatically turn findings into queued work. After the user approves
a coherent change and asks for a durable hand-off, use `/write-brief` as a separate pass.

Deliver only the artifacts requested: diagnosis, journey or page structure, copy deck,
visual direction, implementation, rendered evidence, assumptions, deferred concerns, and a
lean validation plan with observable success or failure behavior.
