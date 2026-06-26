#!/usr/bin/env bash

set -euo pipefail

module_rustfs_install() {
  # require docker only when running installer locally — remote installs use exec_cmd to run docker on the target
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  if container_exists "rustfs"; then
    local recreate
    recreate="$(prompt_yes_no "RustFS already exists. Recreate it?" "n")"
    if [[ "$recreate" == "y" ]]; then
      exec_cmd "docker rm -f rustfs"
    else
      print_info "Skipping RustFS installation"
      return
    fi
  fi

  local api_port access_key secret_key volume_name api_domain rustfs_expose rustfs_image
  read -r -p "Expose RustFS S3 API via Traefik on this subdomain (e.g. s3.example.com, empty to publish ports): " api_domain
  if [[ -z "$api_domain" ]]; then
    api_port="$(prompt_default "Enter RustFS API port" "9000")"
  fi

  print_info "Generating RustFS credentials..."
  read -r -p "Enter RustFS access key (or press enter to generate): " access_key
  if [[ -z "$access_key" ]]; then
    access_key="rustfsuser$(date +%s | tail -c 5)"
    print_info "Generated access key: $access_key"
  fi

  read -r -p "Enter RustFS secret key (or press enter to generate): " secret_key
  if [[ -z "$secret_key" ]]; then
    secret_key="$(openssl rand -base64 32 | tr -d '\n')"
    print_info "Generated secret key: $secret_key"
  fi

  volume_name="$(prompt_default "Enter Docker volume name for RustFS" "rustfs_data")"

  # RustFS is a pure-Rust, S3-compatible store with no x86-64-v2 glibc baseline
  # requirement, so it runs on older/virtualized CPUs. Override with RUSTFS_IMAGE.
  rustfs_image="${RUSTFS_IMAGE:-rustfs/rustfs:latest}"

  print_info "Creating docker network for services..."
  if ! exec_cmd "docker network ls --format '{{.Name}}' | grep -q '^${PROJECT_NAME}\$'"; then
    exec_cmd "docker network create ${PROJECT_NAME} >/dev/null"
  fi

  print_info "Creating RustFS volume..."
  exec_cmd "docker volume create $volume_name >/dev/null 2>&1 || true"

  # RustFS serves the S3 API on :9000 inside the container.
  if [[ -n "$api_domain" ]]; then
    ensure_traefik_network
    rustfs_expose=" --network traefik-public$(traefik_labels rustfs-api "$api_domain" 9000)"
  else
    rustfs_expose="--network=${PROJECT_NAME} -p '$api_port':9000"
  fi

  print_info "Starting RustFS container..."
  exec_cmd "docker run -d \
    --name=rustfs \
    --restart=always \
    $rustfs_expose \
    -v '$volume_name':/data \
    -e RUSTFS_ACCESS_KEY='$access_key' \
    -e RUSTFS_SECRET_KEY='$secret_key' \
    -e RUSTFS_ADDRESS='0.0.0.0:9000' \
    -e RUSTFS_VOLUMES='/data' \
    '$rustfs_image' >/dev/null"

  # When fronted by Traefik the container started on traefik-public; also attach
  # it to the project network so the app can reach RustFS internally.
  if [[ -n "$api_domain" ]]; then
    exec_cmd "docker network connect ${PROJECT_NAME} rustfs >/dev/null 2>&1 || true"
  fi

  # Wait for RustFS to be ready by probing the S3 API port from inside the container.
  print_info "Waiting for RustFS to be ready..."
  local max_attempts=30
  local attempt=0
  while [[ $attempt -lt $max_attempts ]]; do
    if exec_cmd "docker exec rustfs sh -c 'exec 3<>/dev/tcp/127.0.0.1/9000'" >/dev/null 2>&1; then
      print_success "RustFS installed and running"
      if [[ -n "$api_domain" ]]; then
        print_info "API endpoint: https://$api_domain"
      else
        print_info "API endpoint: http://localhost:$api_port"
      fi
      print_info "Access key: $access_key"
      print_info "Secret key: $secret_key"
      print_warning "Save these credentials securely!"
      return
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  print_error "RustFS failed to start after $max_attempts attempts"
  exit 1
}
