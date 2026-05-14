#!/usr/bin/env bash

set -euo pipefail

# Execution context: "local" or "remote"
DEPLOY_TARGET="local"
REMOTE_HOST=""
REMOTE_USER=""
REMOTE_PORT="22"
SSH_IDENTITY=""

# Execute command based on deployment target
exec_cmd() {
  local cmd="$1"
  
  if [[ "$DEPLOY_TARGET" == "local" ]]; then
    eval "$cmd"
  else
    local ssh_args=(-p "$REMOTE_PORT" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
    [[ -n "$SSH_IDENTITY" ]] && ssh_args+=(-i "$SSH_IDENTITY")
    ssh "${ssh_args[@]}" "$REMOTE_USER@$REMOTE_HOST" "$cmd"
  fi
}

run_setup_wizard() {
  print_info "Server Setup Wizard"
  echo ""

  # Ask: project name
  PROJECT_NAME="${PROJECT_NAME:-}"
  if [[ -z "$PROJECT_NAME" ]]; then
    PROJECT_NAME="$(prompt_required "Project name (used for Docker network, container prefixes)")"
  else
    print_info "Using project name: $PROJECT_NAME"
  fi
  export PROJECT_NAME

  # Ask: Local or Remote deployment
  local target
  target="$(prompt_yes_no "Deploy to remote server? (n=local)" "n")"
  
  if [[ "$target" == "y" ]]; then
    DEPLOY_TARGET="remote"
    REMOTE_HOST="$(prompt_required "Remote host")"
    REMOTE_USER="$(prompt_required "Remote user")"
    REMOTE_PORT="$(prompt_default "SSH port" "22")"
    read -r -p "SSH identity file (optional, press enter to skip): " SSH_IDENTITY
    
    print_info "Testing SSH connection..."
    if ! exec_cmd "echo 'Connection successful'"; then
      print_error "Failed to connect to remote server"
      exit 1
    fi
    print_success "Connected to remote server"
    echo ""
  fi

  # Update apt on target system
  print_info "Updating package index on $DEPLOY_TARGET system..."
  exec_cmd "sudo apt update"

  local install_dns install_docker configure_docker_registry configure_docker_user install_drone install_portainer install_traefik install_cloudflared install_redis install_minio

  install_dns="$(prompt_yes_no "Configure DNS (resolvconf)?" "n")"

  # Check if Docker is installed on target
  if exec_cmd "command -v docker >/dev/null 2>&1"; then
    print_success "Docker is already installed on $DEPLOY_TARGET"
    install_docker="n"
  else
    print_info "Docker is not installed on $DEPLOY_TARGET"
    install_docker="$(prompt_yes_no "Install Docker?" "y")"
  fi

  if [[ "$install_docker" == "y" ]] || exec_cmd "command -v docker >/dev/null 2>&1"; then
    configure_docker_registry="$(prompt_yes_no "Configure Docker registry mirror?" "n")"
    configure_docker_user="$(prompt_yes_no "Configure Docker to run without sudo?" "y")"
  else
    configure_docker_registry="n"
    configure_docker_user="n"
  fi

  install_drone="$(prompt_yes_no "Install Drone CI/CD?" "n")"
  install_portainer="$(prompt_yes_no "Install Portainer?" "n")"
  install_traefik="$(prompt_yes_no "Install Traefik reverse proxy?" "y")"
  install_cloudflared="$(prompt_yes_no "Install Cloudflare Tunnel (cloudflared)?" "n")"
  install_redis="$(prompt_yes_no "Install Redis?" "y")"
  install_minio="$(prompt_yes_no "Install Minio (S3-compatible storage)?" "y")"

  echo
  echo "========================================"
  echo "  Installation Summary"
  echo "========================================"
  echo "Project: $PROJECT_NAME"
  echo "Target:  $DEPLOY_TARGET"
  [[ "$DEPLOY_TARGET" == "remote" ]] && echo "Remote:  $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
  echo "----------------------------------------"
  [[ "$install_dns" == "y" ]] && echo "✓ DNS Configuration" || echo "○ DNS Configuration"
  [[ "$install_docker" == "y" ]] && echo "✓ Docker Installation" || echo "○ Docker Installation"
  [[ "$configure_docker_registry" == "y" ]] && echo "✓ Docker Registry Mirror" || echo "○ Docker Registry Mirror"
  [[ "$configure_docker_user" == "y" ]] && echo "✓ Docker User Permissions" || echo "○ Docker User Permissions"
  [[ "$install_drone" == "y" ]] && echo "✓ Drone CI/CD" || echo "○ Drone CI/CD"
  [[ "$install_portainer" == "y" ]] && echo "✓ Portainer" || echo "○ Portainer"
  [[ "$install_traefik" == "y" ]] && echo "✓ Traefik Reverse Proxy" || echo "○ Traefik Reverse Proxy"
  [[ "$install_cloudflared" == "y" ]] && echo "✓ Cloudflare Tunnel" || echo "○ Cloudflare Tunnel"
  [[ "$install_redis" == "y" ]] && echo "✓ Redis" || echo "○ Redis"
  [[ "$install_minio" == "y" ]] && echo "✓ Minio" || echo "○ Minio"
  echo "========================================"

  confirm_or_exit "Proceed with installation? (y/n): "

  [[ "$install_dns" == "y" ]] && module_dns_install
  [[ "$install_docker" == "y" ]] && module_docker_install

  if ! exec_cmd "command -v docker >/dev/null 2>&1"; then
    print_error "Docker is not available on $DEPLOY_TARGET. Cannot continue with Docker-dependent steps."
    exit 1
  fi

  [[ "$configure_docker_registry" == "y" ]] && module_docker_configure_registry
  [[ "$configure_docker_user" == "y" ]] && module_docker_configure_user
  [[ "$install_drone" == "y" ]] && module_drone_install
  [[ "$install_portainer" == "y" ]] && module_portainer_install
  [[ "$install_traefik" == "y" ]] && module_traefik_install
  [[ "$install_cloudflared" == "y" ]] && module_cloudflared_install
  [[ "$install_redis" == "y" ]] && module_redis_install
  [[ "$install_minio" == "y" ]] && module_minio_install

  print_success "Server setup completed on $DEPLOY_TARGET"
  [[ "$DEPLOY_TARGET" == "remote" ]] && print_info "Remote server: $REMOTE_USER@$REMOTE_HOST"
}
