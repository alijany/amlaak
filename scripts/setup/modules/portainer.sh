#!/usr/bin/env bash

set -euo pipefail

module_portainer_install() {
  # require docker only when running installer locally — remote installs use exec_cmd to run docker on the target
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  if container_exists "portainer"; then
    local recreate
    recreate="$(prompt_yes_no "Portainer already exists. Recreate it?" "n")"
    if [[ "$recreate" == "y" ]]; then
      exec_cmd "docker rm -f portainer"
    else
      print_info "Skipping Portainer installation"
      return
    fi
  fi

  local ui_port volume_name traefik_domain portainer_expose
  volume_name="$(prompt_default "Enter Docker volume name for Portainer" "portainer_data")"

  read -r -p "Expose Portainer via Traefik on this subdomain (e.g. portainer.example.com, empty to publish port): " traefik_domain
  if [[ -n "$traefik_domain" ]]; then
    ensure_traefik_network
    # Portainer UI listens on :9000 inside the container.
    portainer_expose=" --network traefik-public$(traefik_labels portainer "$traefik_domain" 9000)"
  else
    ui_port="$(prompt_default "Enter Portainer UI port" "9000")"
    portainer_expose="-p 8000:8000 -p '$ui_port':9000"
  fi

  exec_cmd "docker volume create $volume_name >/dev/null"
  exec_cmd "docker run -d $portainer_expose --name=portainer --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v '$volume_name':/data portainer/portainer-ce:latest >/dev/null"

  print_success "Portainer installed"
}
