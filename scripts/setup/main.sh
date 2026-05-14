#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=./lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"
# shellcheck source=./lib/ssh.sh
source "$SCRIPT_DIR/lib/ssh.sh"
# shellcheck source=./modules/dns.sh
source "$SCRIPT_DIR/modules/dns.sh"
# shellcheck source=./modules/docker.sh
source "$SCRIPT_DIR/modules/docker.sh"
# shellcheck source=./modules/drone.sh
source "$SCRIPT_DIR/modules/drone.sh"
# shellcheck source=./modules/portainer.sh
source "$SCRIPT_DIR/modules/portainer.sh"
# shellcheck source=./modules/traefik.sh
source "$SCRIPT_DIR/modules/traefik.sh"
# shellcheck source=./modules/cloudflared.sh
source "$SCRIPT_DIR/modules/cloudflared.sh"
# shellcheck source=./modules/redis.sh
source "$SCRIPT_DIR/modules/redis.sh"
# shellcheck source=./modules/minio.sh
source "$SCRIPT_DIR/modules/minio.sh"
# shellcheck source=./commands/setup.sh
source "$SCRIPT_DIR/commands/setup.sh"

show_help() {
  cat <<'EOF'
Setup Toolkit

Usage:
  ./scripts/setup/main.sh [command]

Commands:
  setup      Interactive server setup wizard (local or remote)
  help       Show this help

Setup Wizard:
  Interactive wizard that guides you through setting up a server.
  Choose to deploy locally or to a remote server via SSH.

  Components available for installation:
  - DNS (resolvconf with custom nameservers)
  - Docker (with optional registry mirror and user permissions)
  - Drone CI/CD (GitHub OAuth-integrated)
  - Portainer (Docker management UI)
  - Traefik (reverse proxy with Let's Encrypt SSL)
  - Cloudflare Tunnel (cloudflared - local only)
  - Redis (in-memory data store)
  - Minio (S3-compatible object storage)

  The wizard will:
  1. Ask if you want to deploy locally or remotely
  2. If remote, collect SSH connection details
  3. Prompt for which components to install
  4. Show a summary for confirmation
  5. Execute the installation

Examples:
  ./scripts/setup/main.sh setup
  ./scripts/setup/main.sh help

Remote Deployment:
  When selecting remote deployment, you'll need:
  - Remote host (IP or hostname)
  - SSH username
  - SSH port (default: 22)
  - Optional: SSH identity file path

  All prompts happen locally, but commands execute on the remote server.
EOF
}


main() {
  local command="${1:-setup}"
  shift || true

  case "$command" in
    setup)
      run_setup_wizard "$@"
      ;;
    help|-h|--help)
      show_help
      ;;
    *)
      print_error "Unknown command: $command"
      show_help
      exit 1
      ;;
  esac
}

main "$@"
