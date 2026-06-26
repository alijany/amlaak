#!/usr/bin/env bash

set -euo pipefail

# Clean install: remove all Docker containers (running + stopped) but keep
# images, so a fresh setup starts from a blank slate without re-pulling. Also
# prunes dangling networks left behind by removed containers.
module_clean_install() {
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  print_warning "This will stop and remove ALL Docker containers on $DEPLOY_TARGET."
  print_info "Images are preserved; only containers (and unused networks) are removed."
  local confirm
  confirm="$(prompt_yes_no "Proceed with clean install (remove all containers)?" "n")"
  if [[ "$confirm" != "y" ]]; then
    print_info "Skipping clean install"
    return
  fi

  print_info "Stopping and removing all containers..."
  # `docker ps -aq` lists every container id; guard against an empty list so
  # `docker rm` is not invoked with no arguments.
  exec_cmd "ids=\$(docker ps -aq); [ -n \"\$ids\" ] && docker rm -f \$ids >/dev/null || true"

  print_info "Pruning unused networks..."
  exec_cmd "docker network prune -f >/dev/null"

  print_success "Clean install complete — all containers removed, images kept"
}
