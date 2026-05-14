#!/usr/bin/env bash

set -euo pipefail

module_traefik_install() {
  # require docker only when running the installer locally — remote target will be checked via exec_cmd
  if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
    require_cmd docker
  fi

  if container_exists "traefik"; then
    local recreate
    recreate="$(prompt_yes_no "Traefik already exists. Recreate it?" "n")"
    if [[ "$recreate" != "y" ]]; then
      print_info "Skipping Traefik setup"
      return
    fi
    exec_cmd "docker rm -f traefik"
  fi

  if ! exec_cmd "docker network ls --format '{{.Name}}' | grep -q '^traefik-public\$'"; then
    exec_cmd "docker network create traefik-public >/dev/null"
  fi

  local http_port https_port email dashboard_domain enable_redirect dashboard_user dashboard_pass dashboard_hash traefik_image
  http_port="$(prompt_default "Enter HTTP port for Traefik" "8080")"
  https_port="$(prompt_default "Enter HTTPS port for Traefik" "8443")"
  email="$(prompt_required "Enter email for Let's Encrypt")"
  read -r -p "Enter optional dashboard domain (empty to skip): " dashboard_domain
  enable_redirect="$(prompt_yes_no "Enable HTTP to HTTPS redirect?" "y")"
  traefik_image="${TRAEFIK_IMAGE:-traefik:3}"

  exec_cmd "sudo mkdir -p /opt/traefik/letsencrypt /opt/traefik/logs"
  exec_cmd "sudo touch /opt/traefik/letsencrypt/acme.json"
  exec_cmd "sudo chmod 600 /opt/traefik/letsencrypt/acme.json"

  local traefik_config='api:
  dashboard: true
  insecure: false

entryPoints:
  web:
    address: ":80"'

  if [[ "$enable_redirect" == "y" ]]; then
    traefik_config+='
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true'
  fi

  traefik_config+="
  websecure:
    address: \":443\"

certificatesResolvers:
  letsencrypt:
    acme:
      email: $email
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: \"unix:///var/run/docker.sock\"
    exposedByDefault: false
    network: traefik-public
    watch: true"

  exec_cmd "cat > /tmp/traefik.yml <<'YAML'
$traefik_config
YAML"
  exec_cmd "sudo mv /tmp/traefik.yml /opt/traefik/traefik.yml"

  local docker_cmd="docker run --detach --name traefik --restart always --network traefik-public -p '$http_port':80 -p '$https_port':443 -v /var/run/docker.sock:/var/run/docker.sock:ro -v /opt/traefik/traefik.yml:/traefik.yml:ro -v /opt/traefik/letsencrypt:/letsencrypt -v /opt/traefik/logs:/var/log"

  if [[ -n "$dashboard_domain" ]]; then
    dashboard_user="$(prompt_default "Enter dashboard username" "admin")"
    read -r -s -p "Enter dashboard password (input hidden): " dashboard_pass
    echo

    if [[ "${DEPLOY_TARGET:-local}" == "local" ]]; then
      # compute hash locally
      dashboard_hash="$(docker run --rm httpd:alpine htpasswd -nbB "$dashboard_user" "$dashboard_pass")"
    else
      # compute hash on the remote host so the local machine doesn't need the image
      local _u _p
      _u="$(printf '%q' "$dashboard_user")"
      _p="$(printf '%q' "$dashboard_pass")"
      dashboard_hash="$(exec_cmd "docker run --rm httpd:alpine htpasswd -nbB $_u $_p")"
    fi

    docker_cmd+=" --label 'traefik.enable=true' --label 'traefik.http.routers.dashboard.rule=Host(\\\`$dashboard_domain\\\`)' --label 'traefik.http.routers.dashboard.service=api@internal' --label 'traefik.http.routers.dashboard.entrypoints=websecure' --label 'traefik.http.routers.dashboard.tls.certresolver=letsencrypt' --label 'traefik.http.routers.dashboard.middlewares=dashboard-auth' --label 'traefik.http.middlewares.dashboard-auth.basicauth.users=$dashboard_hash'"
  fi

  docker_cmd+=" $traefik_image >/dev/null"
  exec_cmd "$docker_cmd"
  print_success "Traefik installed"
}
