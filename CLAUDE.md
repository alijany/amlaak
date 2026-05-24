# CLAUDE.md — Boilerplate Project Guide

A reusable monorepo boilerplate: NestJS backend + Next.js 15 frontend, with auth, dashboard, Docker-based CI/CD, and server provisioning scripts.

## Monorepo Layout

```
apps/
  core-api/       NestJS backend (port 4000)
  pwa/            Next.js 15 frontend (port 8000)
docker/
  base.Dockerfile shared pnpm dependency layer for both app images
scripts/
  setup/          interactive server provisioning wizard (Docker, Traefik, Redis, MinIO, Drone)
.devcontainer/    VS Code Dev Container config (preferred dev environment)
.drone.yml        CI/CD pipeline — triggers on prd branch push
docker-compose.yml production service definitions (api, pwa, db)
.env.example      root env template — copy to .env
```

## Essential Commands

```bash
pnpm install                          # install all workspace dependencies
pnpm --filter core-api start:dev      # backend dev server (watch mode)
pnpm --filter pwa dev                 # frontend dev server
pnpm --filter core-api build          # build backend
pnpm --filter pwa build               # build frontend
pnpm --filter core-api lint           # lint backend
pnpm --filter pwa lint                # lint frontend
```

Tests (`pnpm test`, `pnpm test:e2e`) are currently unstable. Use `lint` + `build` as the verification loop.

## Dev Environment Setup

### Dev Container (recommended)

1. Open the project in VS Code → "Reopen in Container"
2. PostgreSQL (5432) and Redis (6379) start automatically inside the container
3. Run `pnpm install`, then start the backend and frontend as above

### Manual (local)

1. Copy env files (see Environment Variables below)
2. Start PostgreSQL and Redis locally or via `docker compose up db redis`
3. Run backend and frontend dev servers

## Environment Variables

Three env files are required — none should be committed:

| File | Source | Purpose |
|---|---|---|
| `apps/core-api/.env` | `apps/core-api/.env.example` | Backend-only overrides |
| `apps/pwa/.env.local` | `apps/pwa/.env.example` | Frontend-only public vars |

## Project Naming

`PROJECT_NAME` in `.env` controls all Docker container/network/volume names. To rename the project:
1. Set `PROJECT_NAME=yourproject` in `.env` (and `.env.example` for new clones)
2. Update `"name"` in root `package.json`
3. Add `project_name` Drone secret on your Drone server (must match `PROJECT_NAME`)

## Architecture

### Backend (`apps/core-api/`) — NestJS

Each feature is an isolated NestJS module:

```
src/<feature>/
  <feature>.module.ts      NestJS module definition
  <feature>.controller.ts  HTTP handlers
  <feature>.service.ts     business logic
  <feature>.entity.ts      MikroORM entity
  dtos/                    request/response validation DTOs
```

- ORM base classes live in `src/libs/orm/` — extend them, don't copy them
- Auth module is global (`src/auth/`) — JWT + OTP, role guards, decorators
- Base URL: `http://localhost:4000/api/v1`

### Frontend (`apps/pwa/`) — Next.js 15 App Router

Domain-driven: each business domain is self-contained under `src/app/<domain>/`.

```
src/app/<domain>/
  page.tsx                          route entry (Server Component)
  <domain>.types.*.ts               domain types
  <domain>.service.*.ts             API calls using shared fetcher
  <domain>.hook.use-*.ts            SWR hooks
  <domain>.component.*.tsx          domain components
```

File naming convention: `domain.type.purpose.ext`
- `auth.component.login-form.tsx`
- `items.service.list.ts`
- `items.hook.use-list.ts`
- `items.types.item.ts`

Move code to `src/libs/` or `src/components/` **only** when used across 2+ domains. Auth is global by design.

Shared fetcher: `src/libs/api/` — use it for all HTTP calls.

SSR pattern: Server Component fetches initial data → passes as `initialData` to Client Component → SWR hydrates with `fallbackData`.

## CI/CD (Drone)

- Pipeline defined in `.drone.yml`, scoped to `prd` branch
- Step 1 (`build base`): builds `${PROJECT_NAME}-base:dependencies` image using `docker/base.Dockerfile`
- Step 2 (`build and deploy`): copies env files from host volume, runs `docker compose up -d --no-build`
- App Dockerfiles (`apps/*/Dockerfile`) receive `PROJECT_NAME` as a build arg to reference the base image
- Telegram notification steps exist in `.drone.yml` but are commented out — uncomment and add `token`/`user` secrets to enable

## Adding a New Feature

**Backend:**
1. Create `apps/core-api/src/<feature>/` with the standard module files
2. Register the module in `apps/core-api/src/app.module.ts`
3. Generate a MikroORM migration: `pnpm --filter core-api migration:create`

**Frontend:**
1. Create `apps/pwa/src/app/<feature>/` as a self-contained domain
2. Add types, service (uses shared fetcher), SWR hook, server + client components
3. Add a route in `src/app/<feature>/page.tsx`
4. If the route needs auth protection, wrap with `ProtectedRoute` or `RoleProtectedRoute`

See `apps/core-api/AGENTS.md` and `apps/pwa/AGENTS.md` for detailed patterns and examples.

## What NOT to Do

- Do not commit `.env` files — only `.env.example` files are committed
- Do not add code to the monorepo root — shared code belongs in `apps/*/src/libs/`
- Do not skip MikroORM migrations for entity schema changes
- Do not rely on test results — tests are currently unstable; use `build` + `lint` instead
- Do not hardcode the project name in Dockerfiles or compose files — always use `${PROJECT_NAME}` / `${PROJECT_NAME}`
