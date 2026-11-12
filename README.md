# Navamelk (نوا ملک)

A real-estate lead-generation and marketplace platform — built on a NestJS backend and Next.js 15 frontend. It aggregates property listings from external sources, publishes them to the web and a Telegram channel, tracks inbound inquiries per listing, and lets agencies manage leads and publish their own listings. Includes authentication, RBAC + multi-tenant agencies, a dashboard, Docker-based CI/CD, and a server provisioning toolkit.

> See [`docs/`](./docs) for the product vision, current-state map, roadmap, and the living status board.

## Project Structure

```
apps/
  core-api/     NestJS backend service
  pwa/          Next.js 16 progressive web application
docker/
  base.Dockerfile   shared dependency layer for app images
scripts/
  setup/        interactive server provisioning wizard
.devcontainer/  VS Code Dev Container config
```

- **[PWA](apps/pwa/AGENTS.md)**: Next.js 15 frontend — App Router, auth, dashboard, fa/en localization, domain-driven architecture
- **[Core-API](apps/core-api/AGENTS.md)**: NestJS backend — JWT/OTP auth, MikroORM, Redis, S3 storage

### Monorepo Setup

- **Package Manager**: [pnpm](https://pnpm.io/) workspaces
- **Root config**: `package.json`, `pnpm-workspace.yaml`, `docker-compose.yml`, `.env.example`, `.drone.yml`

### Branch Strategy

- **`main`**: Stable production-ready code
- **`dev`**: Active development branch
- **`prd`**: Production release branch — Drone CI deploys on push

## Technology Stack

### Backend (Core-API)

- **Framework**: NestJS with TypeScript — modular, DI-based, microservice-ready
- **Database**: PostgreSQL + MikroORM — type-safe operations, migrations
- **Cache & Queues**: Redis + BullMQ
- **Authentication**: Passport.js + JWT with OTP support, role-based access control
- **File Storage**: S3-compatible (RustFS for dev, AWS S3 / Arvan Cloud for production)

### Frontend (PWA)

- **Framework**: Next.js 16 with React 19 — App Router, SSR, PWA
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR + custom fetcher
- **Forms**: React Hook Form + Zod
- **Localization**: next-intl — `fa` (RTL, Jalali dates) by default and `en` under `/en`, negotiated automatically with no language switcher; every route is statically rendered per locale ([design](docs/engine/localization.md))
- **Authentication**: OTP-based with JWT, role-based route protection

### DevOps

- **Containerization**: Docker with multi-stage builds and a shared base image
- **Reverse Proxy**: Traefik with automatic Let's Encrypt SSL
- **CI/CD**: Drone CI (triggered on `prd` branch push)
- **Package Manager**: pnpm 9+
- **Dev Environment**: VS Code Dev Container (PostgreSQL + Redis included)

## CI/CD (Drone)

The pipeline in `.drone.yml` runs on every push to `prd`:

1. Builds a shared base image (`${PROJECT_NAME}-base`) from `docker/base.Dockerfile`
2. Copies production env files from a host-mounted volume
3. Runs `docker compose up -d --no-build` to deploy

Required Drone secrets: `project_name` (must match `PROJECT_NAME` in production `.env`).

Telegram notification steps are included in `.drone.yml` but commented out — add `token` and `user` secrets to enable them.

## Getting Started

See [SETUP.md](SETUP.md) for the full first-run checklist.

## Working with coding agents

[AGENTS.md](AGENTS.md) is the canonical agent guide: repository map, exact
verification commands, documentation routing, and durable project rules. Codex
reads it directly; `CLAUDE.md` only imports it for Claude Code and should not
duplicate project instructions. More specific guidance lives beside the code:

- [Core API agent guide](apps/core-api/AGENTS.md)
- [PWA agent guide](apps/pwa/AGENTS.md)
- [Scripts agent guide](scripts/AGENTS.md)
- [Devcontainer runtime validation](.devcontainer/README.md) — app startup,
  Playwright browser checks, and OTP login

Repeatable ways of working are skills in [.claude/skills/](.claude/skills/):
`/task`, `/fix`, `/write-brief`, `/design-ux-ui-copy`, `/seo`, and
`/agent-harness-review`. [docs/README.md](docs/README.md) maps when to use each
and which document owns each kind of decision; approved hand-offs are queued in
[docs/tasks/](docs/tasks/README.md).

Agents validate UI through the Playwright MCP server declared in `.mcp.json`
(and `.codex/config.toml`). Its Chromium is baked into the devcontainer image;
if the server is missing, rebuild the container rather than installing a browser.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, coding standards, and commit guidelines.
