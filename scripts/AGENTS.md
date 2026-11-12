# scripts/

Three unrelated concerns live here; do not conflate them.

## Provisioning — `scripts/setup/`

Interactive, host-shared server provisioning (Docker, Traefik, Redis, RustFS,
Drone, Portainer, …). It mutates a real host and its shared infrastructure, so
it is run **rarely**, by a human operator or an explicitly authorized agent —
never as part of an application deploy. See `scripts/setup/README.md`.

## Application deploy

The normal deploy is pushing to the `prd` branch, which triggers `.drone.yml`
(`docker compose up -d` against `docker-compose.yml`). See the README "CI/CD
(Drone)" section. An agent deploys only by landing code on `prd`, and only when
explicitly asked.

`deploy-offline.sh` is the alternative for an air-gapped VPS: it builds images
locally and ships them over SCP to a real server. It is an operator tool; do not
run it unless the user explicitly asks for an offline deploy.

## Loose helpers

`clear-db.sh` (drops and recreates the local development database) and `gen-env.sh` (creates
the root `.env` with random secrets) are local developer conveniences, not part
of any deploy path. Both are interactive or destructive; ask before running
them.
