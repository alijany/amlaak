#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { printf "%b\n" "${GREEN}✓ $1${NC}"; }
print_error() { printf "%b\n" "${RED}✗ $1${NC}"; }
print_info() { printf "%b\n" "${BLUE}ℹ $1${NC}"; }
print_warning() { printf "%b\n" "${YELLOW}⚠ $1${NC}"; }

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    print_error "Required command not found: $cmd"
    exit 1
  fi
}

confirm_or_exit() {
  local prompt="${1:-Proceed? (y/n): }"
  local confirm
  read -r -p "$prompt" confirm
  if [[ "$confirm" != "y" ]]; then
    print_warning "Operation cancelled by user"
    exit 0
  fi
}

prompt_default() {
  local prompt="$1"
  local default_value="$2"
  local value

  read -r -p "$prompt [default: $default_value]: " value
  value="${value:-$default_value}"
  printf '%s\n' "$value"
}

prompt_required() {
  local prompt="$1"
  local value

  while true; do
    read -r -p "$prompt: " value
    if [[ -n "$value" ]]; then
      printf '%s\n' "$value"
      return
    fi
    print_warning "Value is required"
  done
}

prompt_yes_no() {
  local prompt="$1"
  local default_value="${2:-n}"
  local choice

  read -r -p "$prompt (y/n) [default: $default_value]: " choice
  choice="${choice:-$default_value}"
  printf '%s\n' "$choice"
}

# Ensure the shared traefik-public network exists (idempotent).
# Services attach to this network so Traefik's docker provider can route to them.
ensure_traefik_network() {
  if ! exec_cmd "docker network ls --format '{{.Name}}' | grep -q '^traefik-public\$'"; then
    exec_cmd "docker network create traefik-public >/dev/null"
  fi
}

# Build the docker-run flags that expose a container through Traefik.
# Attaches it to traefik-public and adds an HTTPS router with Let's Encrypt.
# Usage: traefik_labels <router_name> <domain> <internal_port>
traefik_labels() {
  local name="$1" domain="$2" port="$3"
  printf '%s' \
    " --label 'traefik.enable=true'" \
    " --label 'traefik.http.routers.${name}.rule=Host(\`${domain}\`)'" \
    " --label 'traefik.http.routers.${name}.entrypoints=websecure'" \
    " --label 'traefik.http.routers.${name}.tls.certresolver=letsencrypt'" \
    " --label 'traefik.http.services.${name}.loadbalancer.server.port=${port}'"
}

container_exists() {
  local name="$1"
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    docker ps -a --format '{{.Names}}' | grep -Eq "^${name}$"
  else
    exec_cmd "docker ps -a --format '{{.Names}}'" | grep -Eq "^${name}$"
  fi
}

# Execute command based on deployment target
# This function is defined here and used by setup.sh
exec_cmd() {
  local cmd="$1"
  
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    eval "$cmd"
  else
    local ssh_args=(-p "${REMOTE_PORT:-22}" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
    [[ -n "${SSH_IDENTITY:-}" ]] && ssh_args+=(-i "$SSH_IDENTITY")
    ssh "${ssh_args[@]}" "${REMOTE_USER}@${REMOTE_HOST}" "$cmd"
  fi
}
