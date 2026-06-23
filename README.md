# Nava Amlak (نوا املاک)

A real-estate lead-generation and marketplace platform — built on a NestJS backend and Next.js 15 frontend. It aggregates property listings from external sources, publishes them to the web and a Telegram channel, tracks inbound inquiries per listing, and lets agencies manage leads and publish their own listings. Includes authentication, RBAC + multi-tenant agencies, a dashboard, Docker-based CI/CD, and a server provisioning toolkit.

> See [`docs/`](./docs) for the product vision, current-state map, roadmap, and the living status board.

## Project Structure

```
apps/
  core-api/     NestJS backend service
  pwa/          Next.js 15 progressive web application
docker/
  base.Dockerfile   shared dependency layer for app images
scripts/
  setup/        interactive server provisioning wizard
.devcontainer/  VS Code Dev Container config
```

- **[PWA](apps/pwa/AGENTS.md)**: Next.js 15 frontend — App Router, auth, dashboard, domain-driven architecture
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
- **File Storage**: S3-compatible (MinIO for dev, AWS S3 / Arvan Cloud for production)

### Frontend (PWA)

- **Framework**: Next.js 15 with React 19 — App Router, SSR, PWA
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR + custom fetcher
- **Forms**: React Hook Form + Zod
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, coding standards, and commit guidelines.
