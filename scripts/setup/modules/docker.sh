#!/usr/bin/env bash

set -euo pipefail

module_docker_install() {
  print_info "Installing Docker..."
  exec_cmd "curl -fsSL https://get.docker.com -o /tmp/get-docker.sh"
  exec_cmd "sudo sh /tmp/get-docker.sh"
  exec_cmd "rm -f /tmp/get-docker.sh"
  print_success "Docker installation completed"
}

module_docker_configure_registry() {
  local mirror_url
  mirror_url="$(prompt_required "Enter Docker registry mirror URL (e.g. https://mirror.example.com)")"

  print_info "Configuring Docker registry mirror..."
  exec_cmd "sudo bash -c 'cat > /etc/docker/daemon.json <<JSON
{
  \"registry-mirrors\": [\"$mirror_url\"]
}
JSON'"

  exec_cmd "docker logout >/dev/null 2>&1 || true"
  exec_cmd "sudo systemctl restart docker"
  print_success "Docker registry mirror configured"
}

module_docker_configure_user() {
  local target_user
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    target_user="${SUDO_USER:-$USER}"
  else
    target_user="$REMOTE_USER"
  fi

  print_info "Configuring Docker permissions for user '$target_user'..."
  exec_cmd "sudo groupadd docker 2>/dev/null || true"
  exec_cmd "sudo usermod -aG docker $target_user"
  print_success "Docker user permissions configured"
  print_info "Log out and back in for group membership to take effect"
}
