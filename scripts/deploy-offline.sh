#!/usr/bin/env bash
#
# deploy-offline.sh — Offline deployment for Navamelk on an air-gapped VPS.
#
# OVERVIEW
#   The target VPS (root@109.122.247.26) has no internet access and cannot pull
#   images or build anything itself. This script handles the full workflow locally:
#   build images, compress them, ship via SCP, load on the server, and bring
#   containers up with docker compose.
#
#   The server already runs shared infrastructure used by other projects:
#     - Traefik  (traefik-public network) — reverse proxy / TLS termination
#     - Redis    (standalone container)   — shared cache/queue
#     - MinIO    (standalone container)   — shared object storage
#
#   This project gets its own isolated Docker network (named after PROJECT_NAME).
#   Redis and MinIO are connected to that network so the API can reach them
#   without exposing them publicly.
#
# FIRST DEPLOY
#   1. Copy .env.example → .env and fill in all values (PROJECT_NAME, DOMAIN,
#      DB credentials, JWT secrets, S3 keys, Telegram tokens, etc.).
#   2. Run:
#        ./scripts/deploy-offline.sh
#      This builds images, sets up the network, ships everything, and starts
#      all services (api, pwa, db).
#
# SUBSEQUENT UPDATES (code changes only, db stays up)
#   ./scripts/deploy-offline.sh update
#
# COMMANDS
#   all      (default) build + ship — full first deploy
#   build    Build base/api/pwa images locally and save a gzipped bundle
#   ship     Copy bundle + config to server, set up network, start all services
#   update   Rebuild images, ship, restart only api + pwa (db is untouched)
#   network  (Re-)create the app network and connect redis + minio to it
#
# OVERRIDES
#   SSH_HOST=root@1.2.3.4 REMOTE_DIR=/opt/other ./scripts/deploy-offline.sh
#
# PREREQUISITES (local machine)
#   - Docker with BuildKit support
#   - SSH access to the server (key-based auth recommended)
#   - .env file present in the project root
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Config (override via environment)
# ---------------------------------------------------------------------------
SSH_HOST="${SSH_HOST:-root@109.122.247.26}"
REMOTE_DIR="${REMOTE_DIR:-/opt/nava-melk}"
PLATFORM="${PLATFORM:-linux/amd64}"

# Shared services already running on the server that need to join the app network.
# redis and minio are standalone containers (not managed by this compose).
SHARED_SERVICES=(redis minio)

# Resolve project root (one level up from scripts/) regardless of where called from.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load PROJECT_NAME and the NEXT_PUBLIC_* build args from the local .env.
if [[ ! -f .env ]]; then
  echo "ERROR: .env not found in $ROOT_DIR — copy .env.example to .env and fill in values." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a

PROJECT_NAME="${PROJECT_NAME:?PROJECT_NAME must be set in .env}"
APP_NETWORK="${PROJECT_NAME}"        # internal network name (docker-compose uses name: ${PROJECT_NAME})
BASE_IMAGE="${PROJECT_NAME}-base:dependencies"
API_IMAGE="${PROJECT_NAME}-api:latest"
PWA_IMAGE="${PROJECT_NAME}-pwa:latest"

BUNDLE="${PROJECT_NAME}-images.tar.gz"
BUNDLE_PATH="${ROOT_DIR}/${BUNDLE}"

export DOCKER_BUILDKIT=1

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWARN: %s\033[0m\n' "$*"; }

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
build() {
  log "Building base image ($BASE_IMAGE) for $PLATFORM"
  docker build \
    --platform "$PLATFORM" \
    --build-arg PROJECT_NAME="$PROJECT_NAME" \
    --target dependencies \
    -t "$BASE_IMAGE" \
    -f docker/base.Dockerfile .

  log "Building API image ($API_IMAGE)"
  docker build \
    --platform "$PLATFORM" \
    --build-arg PROJECT_NAME="$PROJECT_NAME" \
    -t "$API_IMAGE" \
    -f apps/core-api/Dockerfile .

  log "Building PWA image ($PWA_IMAGE)"
  docker build \
    --platform "$PLATFORM" \
    --target runner \
    --build-arg PROJECT_NAME="$PROJECT_NAME" \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}" \
    --build-arg NEXT_PUBLIC_CLARITY_PROJECT_ID="${NEXT_PUBLIC_CLARITY_PROJECT_ID:-}" \
    --network host \
    -t "$PWA_IMAGE" \
    -f apps/pwa/Dockerfile .

  # Collect any third-party images referenced in compose (camofox, xray, etc.)
  # that are not built by this script. Pull them locally so they can be bundled.
  EXTRA_IMAGES=()
  while IFS= read -r img; do
    case "$img" in
      "${PROJECT_NAME}-"*) ;;  # skip our own built images
      "")                  ;;
      *)
        log "Pulling third-party image: $img"
        docker pull --platform "$PLATFORM" "$img" || warn "Could not pull $img — skipping."
        EXTRA_IMAGES+=("$img")
        ;;
    esac
  done < <(docker compose config --images 2>/dev/null | sort -u)

  log "Saving images to $BUNDLE"
  docker save "$API_IMAGE" "$PWA_IMAGE" "${EXTRA_IMAGES[@]}" | gzip > "$BUNDLE_PATH"
  log "Bundle ready: $BUNDLE_PATH ($(du -h "$BUNDLE_PATH" | cut -f1))"
}

# ---------------------------------------------------------------------------
# Network setup on the server
# Creates the app network and connects shared services (redis, minio) to it.
# Safe to re-run — skips already-connected services.
# ---------------------------------------------------------------------------
setup_network() {
  local network="$1"
  shift
  local services=("$@")

  log "Setting up app network '$network' on server"
  ssh "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail

# Create the network if it doesn't exist.
if ! docker network inspect '$network' &>/dev/null; then
  echo "--> Creating Docker network: $network"
  docker network create '$network'
else
  echo "--> Network '$network' already exists."
fi

# Connect each shared service to the app network (idempotent).
for svc in ${services[*]}; do
  if docker inspect "\$svc" &>/dev/null; then
    if docker network inspect '$network' --format '{{range .Containers}}{{.Name}} {{end}}' | grep -qw "\$svc"; then
      echo "--> \$svc already connected to '$network', skipping."
    else
      echo "--> Connecting \$svc to '$network'..."
      docker network connect '$network' "\$svc"
    fi
  else
    echo "WARN: container '\$svc' not found — skipping network connect."
  fi
done

echo "--> Network setup complete."
REMOTE
}

# ---------------------------------------------------------------------------
# Ship + deploy
# ---------------------------------------------------------------------------
ship() {
  if [[ ! -f "$BUNDLE_PATH" ]]; then
    echo "ERROR: $BUNDLE_PATH not found. Run the build step first." >&2
    exit 1
  fi

  if [[ ! -f ".env" ]]; then
    echo "ERROR: .env not found — required on the server for docker compose." >&2
    exit 1
  fi

  log "Preparing remote directory ${SSH_HOST}:${REMOTE_DIR}"
  ssh "$SSH_HOST" "mkdir -p '$REMOTE_DIR'"

  # Network and shared-service wiring first, so compose can start immediately after load.
  setup_network "$APP_NETWORK" "${SHARED_SERVICES[@]}"

  log "Copying files to ${SSH_HOST}:${REMOTE_DIR}"
  scp docker-compose.yml "${SSH_HOST}:${REMOTE_DIR}/docker-compose.yml"
  scp .env               "${SSH_HOST}:${REMOTE_DIR}/.env"
  scp "$BUNDLE_PATH"     "${SSH_HOST}:${REMOTE_DIR}/${BUNDLE}"

  log "Loading images and restarting services on the server"
  ssh "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd '$REMOTE_DIR'

echo '--> Loading images...'
gunzip -c '$BUNDLE' | docker load

echo '--> Starting all containers...'
docker compose up -d --no-build --force-recreate

echo '--> Pruning dangling images...'
docker image prune -f

echo '--> Cleaning up bundle...'
rm -f '$BUNDLE'

echo '--> Done. Running containers:'
docker compose ps
REMOTE

  log "Deploy complete."
}

# ---------------------------------------------------------------------------
# Update — rebuild images and restart only api + pwa (leave db untouched)
# ---------------------------------------------------------------------------
update() {
  if [[ ! -f ".env" ]]; then
    echo "ERROR: .env not found — required on the server for docker compose." >&2
    exit 1
  fi

  build

  log "Copying files to ${SSH_HOST}:${REMOTE_DIR}"
  ssh "$SSH_HOST" "mkdir -p '$REMOTE_DIR'"
  scp docker-compose.yml "${SSH_HOST}:${REMOTE_DIR}/docker-compose.yml"
  scp .env               "${SSH_HOST}:${REMOTE_DIR}/.env"
  scp "$BUNDLE_PATH"     "${SSH_HOST}:${REMOTE_DIR}/${BUNDLE}"

  log "Loading images and restarting api + pwa on the server"
  ssh "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd '$REMOTE_DIR'

echo '--> Loading images...'
gunzip -c '$BUNDLE' | docker load

echo '--> Restarting app services (db left untouched)...'
# Collect all services defined in compose, then exclude db so its data is preserved.
services=$(docker compose config --services | grep -v '^db$' | tr '\n' ' ')
# shellcheck disable=SC2086
docker compose up -d --no-build --force-recreate $services

echo '--> Pruning dangling images...'
docker image prune -f

echo '--> Cleaning up bundle...'
rm -f '$BUNDLE'

echo '--> Done. Running containers:'
docker compose ps
REMOTE

  log "Update complete."
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
case "${1:-all}" in
  build)   build ;;
  ship)    ship ;;
  update)  update ;;
  network) setup_network "$APP_NETWORK" "${SHARED_SERVICES[@]}" ;;
  all)     build; ship ;;
  *)
    echo "Usage: $0 [build|ship|update|network|all]" >&2
    exit 1
    ;;
esac
