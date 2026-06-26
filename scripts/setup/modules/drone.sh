#!/usr/bin/env bash

set -euo pipefail

module_drone_install() {
  # require docker only when running installer locally — remote installs use exec_cmd to run docker on the target
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  local drone_host github_client_id github_client_secret github_username rpc_secret traefik_domain

  # Drone is always fronted by Traefik (which terminates TLS for DRONE_SERVER_PROTO=https).
  drone_host="$(prompt_required "Enter Drone server host / Traefik subdomain (e.g. ci.example.com)")"
  traefik_domain="$drone_host"
  github_client_id="$(prompt_required "Enter GitHub OAuth client ID")"
  github_client_secret="$(prompt_required "Enter GitHub OAuth client secret")"
  github_username="$(prompt_required "Enter GitHub admin username")"
  rpc_secret="$(openssl rand -hex 16)"

  if container_exists "drone"; then
    local recreate
    recreate="$(prompt_yes_no "Drone already exists. Recreate it?" "n")"
    if [[ "$recreate" != "y" ]]; then
      print_info "Skipping Drone installation"
      return
    fi

    exec_cmd "docker rm -f drone >/dev/null"
    exec_cmd "docker rm -f runner >/dev/null 2>&1 || true"
  fi

  # Drone server listens on :80 inside the container; Traefik terminates TLS.
  ensure_traefik_network
  local drone_expose
  drone_expose=" --network traefik-public$(traefik_labels drone "$traefik_domain" 80)"

  exec_cmd "docker run --volume=/var/lib/drone:/data \
    --env=DRONE_GITHUB_CLIENT_ID='$github_client_id' \
    --env=DRONE_GITHUB_CLIENT_SECRET='$github_client_secret' \
    --env=DRONE_RPC_SECRET='$rpc_secret' \
    --env=DRONE_SERVER_HOST='$drone_host' \
    --env=DRONE_SERVER_PROTO=https \
    --env=DRONE_TLS_AUTOCERT=false \
    --env=DRONE_REGISTRATION_CLOSED=false \
    --env=DRONE_USER_CREATE='username:$github_username,admin:true' \
    $drone_expose \
    --restart=always \
    --detach=true \
    --name=drone \
    drone/drone >/dev/null"

  exec_cmd "docker run --detach \
    --volume=/var/run/docker.sock:/var/run/docker.sock \
    --env=DRONE_RPC_PROTO=https \
    --env=DRONE_RPC_HOST='$drone_host' \
    --env=DRONE_RPC_SECRET='$rpc_secret' \
    --env=DRONE_RUNNER_CAPACITY=2 \
    --env=DRONE_RUNNER_NAME=runner \
    --env=DRONE_RPC_SKIP_VERIFY=true \
    --publish=3000:3000 \
    --restart=always \
    --name=runner \
    drone/drone-runner-docker:1 >/dev/null"

  print_success "Drone installed"
}
