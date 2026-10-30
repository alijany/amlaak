# UI & Visual Design Workflow

For design languages, visual redesign of existing surfaces, new screens from an approved
brief, direction exploration, and design QA. Use the nearest app guide and existing product
components for implementation mechanics.

## Hold the responsibility boundary

In a visual task, treat the approved journey, IA, action logic, required information, copy meaning, and product behavior as fixed. If one of them has to change for the visual work to succeed, report the conflict and go back to [ux-design.md](ux-design.md) or [content-design.md](content-design.md).

This boundary matters because structural problems solved quietly inside a visual pass are invisible to everyone reviewing the change — they show up later as behavior nobody agreed to.

Draw from sources in this order:

1. the approved product, UX, and content brief
2. actual product components, semantic tokens, and existing surfaces
3. `DESIGN_LANGUAGE.md` or equivalent
4. native platform and domain conventions
5. a new visual decision, with the justification recorded

## Build or revise a design language

Audit what's actually rendered — plus brand assets, theme files, tokens, primitives, and repeated component patterns. Sort what you find:

- `EXISTING STANDARD` — working, preserve it
- `INCONSISTENCY` — needs a decision
- `BRAND CONSTRAINT` — not casually changed
- `TASTE HYPOTHESIS` — yours, needs confirmation

Map every rule to a real source in the codebase. Don't build from memory of how some admired product looks, and don't create a parallel token system beside the existing one — two token systems is strictly worse than one imperfect one.

Surface the real tensions and recommend a resolution: density, light/dark priority, radius, elevation, typographic character, motion, quiet vs. expressive. Stop before finalizing.

After approval, define semantic rules for typography, color, spacing, grid, density, breakpoints, surfaces, borders, elevation, radius, iconography, illustration, motion, reduced motion, focus, keyboard, localization, long content, RTL, composition, and states. For each token: use / do-not-use guidance, source mapping, and existing / revised / new status.

Then test the rules on two meaningfully different surfaces. Rules that need ad-hoc exceptions on their second application are wrong rules — revise them rather than accumulating exceptions.

## Redesign an existing surface

1. Run it at the required viewports and interact with the states that matter.
2. Capture a visual baseline — you need it for the before/after.
3. Audit hierarchy, composition, density, spacing, typography, color, affordance, responsiveness, accessibility, content resilience, consistency.
4. Label visible defects `[OBSERVED]`; label user-impact claims `[HYPOTHESIS]`.
5. Note what's working and will be preserved.
6. Propose the smallest coherent change set: location → finding → change → token or pattern.
7. Stop for approval when the direction is consequential.
8. Implement approved changes with existing primitives and semantic tokens.
9. Re-render the same viewports and states. Test realistic content, overflow, zoom, focus order, touch and hover, layout shift, localization, RTL.

## Design a new surface

Require a brief covering user job, information, actions, behavior, copy, and relevant states. Ask only for the missing decisions that would materially change the UI.

- Map each brief element to an existing component or familiar pattern.
- Set first / second / third visual priority from the approved information and action hierarchy — not from what's most fun to style.
- Plan layout, density, responsive transformation, composition, feedback.
- Build the state matrix from real interaction, system, data, permission, and content requirements.
- Stop for approval before a consequential composition or a new pattern.
- If approved copy or behavior makes the layout awkward, report the conflict — don't rewrite the copy to fit the design.

## Explore directions

- Hold functionality, copy, data, state, viewport, and polish level constant across variants, so the comparison is actually about the visual direction.
- Produce 2–3 genuinely different expressions within the design language. Two strong options beat three where one is filler.
- Vary layout, density, emphasis, rhythm, treatment — never product behavior.
- Name the comparison axes. Don't claim user impact you haven't tested.
- Build in isolation; never overwrite production while exploring.
- Present at the same scale and state, then stop. Don't pick, and don't merge them into a compromise — merged directions usually lose what made either one good.

## Design QA

QA without rendering isn't QA. If the environment can't render the surface, report visual QA as incomplete rather than inspecting code and calling it done.

Sweep in this order:

1. **Layout and responsiveness** — containers, grids, breakpoints, overflow, zoom to 200%, long content, localization, RTL
2. **Spacing and alignment** — grid adherence, vertical rhythm, sibling gaps, optical alignment
3. **Typography** — role usage, hierarchy, line length (~45–75 characters for body), wrapping, weight, truncation
4. **Color and surfaces** — semantic roles, contrast, accent discipline, borders, elevation, theme parity
5. **States** — hover, focus, active, disabled, loading, empty, error, success, touch, reduced motion
6. **Consistency** — variants, icons, radii, shadows, dividers, feedback timing

Accessibility floors worth checking every time, since they're objective and cheap to verify: text contrast 4.5:1 (3:1 for text at 18.66px+ bold or 24px+), non-text and UI component contrast 3:1, touch targets at least 44×44px, a visible focus indicator on every interactive element, and no information carried by color alone.

Record findings as: rendered location → `[OBSERVED]` issue → violated rule or token → severity → bounded fix. Don't invent findings to fill a category — a clean category is a real result.

Fix in severity order, without unrelated cleanup or structural change. Re-render the same viewports and states, check the other surfaces that share the components you touched, and repeat until in-scope issues are resolved or a constraint blocks them.
