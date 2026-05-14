#!/usr/bin/env bash

set -euo pipefail

module_redis_install() {
  # require docker only when running installer locally — remote installs use exec_cmd to run docker on the target
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  if container_exists "redis"; then
    local recreate
    recreate="$(prompt_yes_no "Redis already exists. Recreate it?" "n")"
    if [[ "$recreate" == "y" ]]; then
      exec_cmd "docker rm -f redis"
    else
      print_info "Skipping Redis installation"
      return
    fi
  fi

  local port volume_name
  port="$(prompt_default "Enter Redis port" "6379")"
  volume_name="$(prompt_default "Enter Docker volume name for Redis" "redis_data")"

  print_info "Creating docker network for services..."
  if ! exec_cmd "docker network ls --format '{{.Name}}' | grep -q '^${PROJECT_NAME}\$'"; then
    exec_cmd "docker network create ${PROJECT_NAME} >/dev/null"
  fi

  print_info "Creating Redis volume..."
  exec_cmd "docker volume create $volume_name >/dev/null 2>&1 || true"

  print_info "Starting Redis container..."
  exec_cmd "docker run -d \
    --name=redis \
    --restart=always \
    --network=${PROJECT_NAME} \
    -p '$port':6379 \
    -v '$volume_name':/data \
    redis:7.4.1 \
    redis-server --appendonly yes >/dev/null"

  # Wait for Redis to be ready
  print_info "Waiting for Redis to be ready..."
  local max_attempts=30
  local attempt=0
  while [[ $attempt -lt $max_attempts ]]; do
    if exec_cmd "docker exec redis redis-cli ping" >/dev/null 2>&1; then
      print_success "Redis installed and running on port $port"
      return
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  print_error "Redis failed to start after $max_attempts attempts"
  exit 1
}
