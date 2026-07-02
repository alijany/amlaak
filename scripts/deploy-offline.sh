#!/usr/bin/env bash
#
# deploy-offline.sh — Build images locally, ship them to an air-gapped VPS, and update.
#
# The VPS has no internet access, so it cannot build images itself. This script:
#   1. Builds the base, api, and pwa images locally (for linux/amd64).
#   2. Saves api + pwa into a single gzipped tarball.
#   3. Copies the tarball + docker-compose.yml to the server over SSH.
#   4. Loads the images on the server and runs `docker compose up -d --no-build`.
#
# Usage:
#   ./scripts/deploy-offline.sh            # build + ship + deploy (default)
#   ./scripts/deploy-offline.sh build      # build images only
#   ./scripts/deploy-offline.sh ship       # ship + deploy a previously built bundle
#
# Override defaults via env vars, e.g.:
#   SSH_HOST=root@1.2.3.4 REMOTE_DIR=/opt/smm ./scripts/deploy-offline.sh
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Config (override via environment)
# ---------------------------------------------------------------------------
SSH_HOST="${SSH_HOST:-root@109.122.247.26}"
REMOTE_DIR="${REMOTE_DIR:-/opt/smm}"
PLATFORM="${PLATFORM:-linux/amd64}"

# Resolve project root (one level up from scripts/) regardless of where called from.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load PROJECT_NAME and the NEXT_PUBLIC_* build args from the local .env.
if [[ ! -f .env ]]; then
  echo "ERROR: .env not found in $ROOT_DIR — required for PROJECT_NAME and build args." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a

PROJECT_NAME="${PROJECT_NAME:?PROJECT_NAME must be set in .env}"
BASE_IMAGE="${PROJECT_NAME}-base:dependencies"
API_IMAGE="${PROJECT_NAME}-api:latest"
PWA_IMAGE="${PROJECT_NAME}-pwa:latest"

BUNDLE="${PROJECT_NAME}-images.tar.gz"
BUNDLE_PATH="${ROOT_DIR}/${BUNDLE}"

export DOCKER_BUILDKIT=1

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

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

  log "Saving images to $BUNDLE"
  docker save "$API_IMAGE" "$PWA_IMAGE" | gzip > "$BUNDLE_PATH"
  log "Bundle ready: $BUNDLE_PATH ($(du -h "$BUNDLE_PATH" | cut -f1))"
}

# ---------------------------------------------------------------------------
# Ship + deploy
# ---------------------------------------------------------------------------
ship() {
  if [[ ! -f "$BUNDLE_PATH" ]]; then
    echo "ERROR: $BUNDLE_PATH not found. Run the build step first." >&2
    exit 1
  fi

  log "Copying docker-compose.yml and image bundle to ${SSH_HOST}:${REMOTE_DIR}"
  ssh "$SSH_HOST" "mkdir -p '$REMOTE_DIR'"
  scp docker-compose.yml "${SSH_HOST}:${REMOTE_DIR}/docker-compose.yml"
  scp "$BUNDLE_PATH" "${SSH_HOST}:${REMOTE_DIR}/${BUNDLE}"

  log "Loading images and restarting services on the server"
  ssh "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
cd '$REMOTE_DIR'

echo '--> Loading images...'
gunzip -c '$BUNDLE' | docker load

echo '--> Recreating api + pwa containers...'
docker compose up -d --no-build --force-recreate api pwa

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
# Entry point
# ---------------------------------------------------------------------------
case "${1:-all}" in
  build) build ;;
  ship)  ship ;;
  all)   build; ship ;;
  *)
    echo "Usage: $0 [build|ship|all]" >&2
    exit 1
    ;;
esac
