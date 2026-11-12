# Repository guide for coding agents

This repository is a pnpm monorepo boilerplate for web applications: a NestJS
API and a Next.js 16 frontend with OTP/JWT authentication, a role-aware
dashboard shell, Docker-based CI/CD,
and server provisioning scripts.

## Start here

Read only the context needed for the task:

1. Read this file.
2. Read the nearest guide when touching that area:
   - `apps/core-api/AGENTS.md` for backend work.
   - `apps/pwa/AGENTS.md` for frontend work.
   - `scripts/AGENTS.md` for provisioning, deploy, or helper scripts.
3. For product work, open `docs/README.md` and follow its routing to the state,
   product, or engine document the task needs.
4. If the task has a brief in `docs/tasks/`, treat it as the agreed hand-off.
5. Open an engine or product document only when the task needs its decisions.

User instructions and the code in the current branch take precedence when a
document is stale. Call out material conflicts instead of silently guessing.

## Repository map

```text
apps/core-api/   NestJS API, PostgreSQL/MikroORM, Redis/BullMQ, S3
apps/pwa/        Next.js 16 App Router frontend, React 19, SWR
docker/          Shared dependency base image for both app images
docs/            Product scope, living state, architecture, and task briefs
scripts/         Server provisioning, offline deploy, and local helpers
.claude/skills/  Agent procedures (task, fix, write-brief, design, SEO, harness review)
.devcontainer/   Preferred local development environment
```

Keep feature code inside the owning app; never add code to the monorepo root.
Shared code belongs in that app's `src/libs/` or `src/components/` only after it
is used by at least two domains.

## Commands

Run commands from the repository root:

```bash
pnpm install
pnpm dev:back                      # API on :4000, output mirrored to /tmp/back.log
pnpm dev:front                     # web app on :8000
pnpm --filter core-api lint        # type-check + ESLint --fix (modifies files)
pnpm --filter pwa lint             # type-check + ESLint
pnpm --filter core-api build
pnpm --filter pwa build
```

Use the app-scoped `lint` command as the normal verification loop for changed
TypeScript/TSX. Tests are currently unreliable and the root `pnpm test` is a
placeholder, so do not report the repository test suite as passing. Run a
targeted app test only when the task changes tested behavior or the user asks.
Production builds are not required for routine edits; run one when changing
build/runtime configuration or when explicitly requested.

Do not run broad formatting or auto-fix commands across untouched files. The
core-api lint script auto-fixes; inspect the resulting diff and revert changes
to files the task did not touch.

## Runtime validation

When a task needs runtime, browser, authenticated-route, or container-network
validation, read `.devcontainer/README.md` and follow the relevant section.
Use Playwright for rendered frontend checks and verify a relevant API request
separately; frontend HTML alone does not prove its data path works. Never add an
auth bypass or weaken roles for validation.

## Working agreements

- Preserve unrelated working-tree changes. Never discard or overwrite work you
  did not create.
- Do not design for hypothetical future requirements; implement observed scope.
- Prefer focused changes that follow nearby code over new abstractions.
- Do not add a production dependency or change infrastructure/provider choices
  without explicit approval.
- Never commit `.env` files or expose secrets. Update the matching
  `.env.example` when a new variable is required.
- Search for existing implementations before creating helpers, components,
  entities, DTOs, or API wrappers.
- Update the owning document when behavior, scope, or a milestone changes.
  Keep status in state files, design in engine docs, and scope in the product
  doc that `docs/README.md` names; cross-link instead of duplicating facts.
- Task briefs use a stable numeric filename prefix (`007-invite-members.md`).
  The ID never changes with priority or gets reused; `docs/tasks/README.md` owns
  allocation and execution order. Keep the writing date inside the brief.
- In the final hand-off, list changed files, verification run, and any remaining
  risk or manual step.

## Cross-cutting invariants

- Backend entities extend the bases in `apps/core-api/src/libs/orm/`; do not
  reimplement common persistence behavior.
- Frontend domains are self-contained under `apps/pwa/src/app/[locale]/<domain>/`.
- Frontend requests use the shared fetchers and SWR helpers. Render async state
  with `DataView`; see `apps/pwa/AGENTS.md` for the complete pattern.
- This project is Persian-only and is not localized: write UI copy directly in
  Persian and do not add next-intl or locale routing.
- API refusals a person can see throw a `Coded*Exception` with an English
  `message` and a stable `code`. The backend renders copy itself only for SMS,
  from `apps/core-api/src/libs/i18n/`.
- Do not create authentication bypasses for reviewer or demo access. Reviewer
  credentials and SMS delivery are operational concerns.
- `PROJECT_NAME` in `.env` names every Docker container, network, and volume.
  Keep Docker identifiers parameterized with it; do not hardcode the project
  name in Docker or Compose files. A rename also changes `"name"` in the root
  `package.json` and the `project_name` Drone secret.

## Documentation routing

- `docs/README.md`: current focus and documentation map.
- `docs/tasks/`: approved, not-yet-completed hand-off briefs; its `README.md`
  owns both the scheduled queue and the deferred backlog.
- `.devcontainer/README.md`: runtime, browser, login, and container-network
  validation.
- `README.md` and `SETUP.md`: human onboarding, CI/CD, and first deploy.

When a correction should persist for future agents, update the closest
`AGENTS.md` rather than expanding a one-off prompt or duplicating it elsewhere.

## Agent harness feedback

If repository-induced friction materially affects a task, append a factual observation to
`docs/agent-friction-log.md`. Log the event only when it caused a concrete execution cost,
such as a wrong implementation, failed verification, substantial avoidable search, a retry,
or human intervention. Do not log routine exploration or infer a harness change from the
event; the `agent-harness-review` skill owns that decision.
