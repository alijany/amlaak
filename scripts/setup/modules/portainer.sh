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

  local ui_port volume_name
  ui_port="$(prompt_default "Enter Portainer UI port" "9000")"
  volume_name="$(prompt_default "Enter Docker volume name for Portainer" "portainer_data")"

  exec_cmd "docker volume create $volume_name >/dev/null"
  exec_cmd "docker run -d -p 8000:8000 -p '$ui_port':9000 --name=portainer --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v '$volume_name':/data portainer/portainer-ce:latest >/dev/null"

  print_success "Portainer installed"
}
