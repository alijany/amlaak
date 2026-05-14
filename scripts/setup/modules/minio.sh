#!/usr/bin/env bash

set -euo pipefail

module_minio_install() {
  # require docker only when running installer locally — remote installs use exec_cmd to run docker on the target
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  if container_exists "minio"; then
    local recreate
    recreate="$(prompt_yes_no "Minio already exists. Recreate it?" "n")"
    if [[ "$recreate" == "y" ]]; then
      exec_cmd "docker rm -f minio"
    else
      print_info "Skipping Minio installation"
      return
    fi
  fi

  local api_port console_port access_key secret_key volume_name
  api_port="$(prompt_default "Enter Minio API port" "9000")"
  console_port="$(prompt_default "Enter Minio console port" "9001")"
  
  print_info "Generating Minio credentials..."
  access_key="$(prompt_required "Enter Minio root access key (or press enter to generate)")"
  if [[ -z "$access_key" ]]; then
    access_key="miniouser$(date +%s | tail -c 5)"
    print_info "Generated access key: $access_key"
  fi
  
  secret_key="$(prompt_required "Enter Minio root secret key (or press enter to generate)")"
  if [[ -z "$secret_key" ]]; then
    secret_key="$(openssl rand -base64 32 | tr -d '\n')"
    print_info "Generated secret key: $secret_key"
  fi
  
  volume_name="$(prompt_default "Enter Docker volume name for Minio" "minio_data")"

  print_info "Creating docker network for services..."
  if ! exec_cmd "docker network ls --format '{{.Name}}' | grep -q '^${PROJECT_NAME}\$'"; then
    exec_cmd "docker network create ${PROJECT_NAME} >/dev/null"
  fi

  print_info "Creating Minio volume..."
  exec_cmd "docker volume create $volume_name >/dev/null 2>&1 || true"

  print_info "Starting Minio container..."
  exec_cmd "docker run -d \
    --name=minio \
    --restart=always \
    --network=${PROJECT_NAME} \
    -p '$api_port':9000 \
    -p '$console_port':9001 \
    -v '$volume_name':/data \
    -e MINIO_ROOT_USER='$access_key' \
    -e MINIO_ROOT_PASSWORD='$secret_key' \
    minio/minio:latest \
    server /data --console-address ':9001' >/dev/null"

  # Wait for Minio to be ready
  print_info "Waiting for Minio to be ready..."
  local max_attempts=30
  local attempt=0
  while [[ $attempt -lt $max_attempts ]]; do
    if exec_cmd "docker exec minio mc ready local" >/dev/null 2>&1; then
      print_success "Minio installed and running"
      print_info "API endpoint: http://localhost:$api_port"
      print_info "Console: http://localhost:$console_port"
      print_info "Access key: $access_key"
      print_info "Secret key: $secret_key"
      print_warning "Save these credentials securely!"
      return
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  print_error "Minio failed to start after $max_attempts attempts"
  exit 1
}
