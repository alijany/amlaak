#!/usr/bin/env bash

set -euo pipefail

module_cloudflared_install() {
  print_info "Note: Cloudflared installation requires interactive browser authentication"
  print_warning "This module only supports local installation"
  
  if [[ "${DEPLOY_TARGET:-local}" == "remote" ]]; then
    print_error "Cloudflared cannot be installed remotely due to interactive authentication requirements"
    return
  fi

  if ! command -v cloudflared >/dev/null 2>&1; then
    print_info "Installing cloudflared..."
    wget -q -O /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i /tmp/cloudflared.deb
    rm -f /tmp/cloudflared.deb
  fi

  print_info "Cloudflared installed. Starting interactive tunnel setup..."

  mkdir -p "$HOME/.cloudflared"

  if [[ ! -f "$HOME/.cloudflared/cert.pem" ]]; then
    print_info "Authenticate with Cloudflare in browser"
    cloudflared tunnel login
  fi

  local tunnel_name
  tunnel_name="$(prompt_required "Enter tunnel name")"

  local tunnel_id
  tunnel_id="$(cloudflared tunnel list 2>/dev/null | awk -v name="$tunnel_name" '$2 == name {print $1; exit}')"

  if [[ -z "$tunnel_id" ]]; then
    cloudflared tunnel create "$tunnel_name"
    tunnel_id="$(cloudflared tunnel list | awk -v name="$tunnel_name" '$2 == name {print $1; exit}')"
  fi

  local cred_file
  cred_file="$HOME/.cloudflared/$tunnel_id.json"

  cat > "$HOME/.cloudflared/config.yml" <<EOF
tunnel: $tunnel_id
credentials-file: $cred_file

ingress:
  - hostname: change-this.example.com
    service: http://localhost:8080
  - service: http_status:404
EOF

  print_warning "Update $HOME/.cloudflared/config.yml hostnames/services before production use"

  local install_service
  install_service="$(prompt_yes_no "Install cloudflared as a system service?" "y")"
  if [[ "$install_service" == "y" ]]; then
    sudo cloudflared service install
    sudo systemctl enable cloudflared
    sudo systemctl restart cloudflared
    print_success "Cloudflared service installed and started"
  else
    print_info "Run manually: cloudflared tunnel --config ~/.cloudflared/config.yml run $tunnel_name"
  fi
}
