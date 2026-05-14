#!/usr/bin/env bash

set -euo pipefail

module_dns_install() {
  print_info "Installing resolvconf..."
  exec_cmd "sudo apt install -y resolvconf"

  local primary secondary
  primary="$(prompt_default "Enter primary nameserver" "1.1.1.1")"
  secondary="$(prompt_default "Enter secondary nameserver" "8.8.8.8")"

  print_info "Configuring DNS servers..."
  exec_cmd "sudo bash -c 'echo \"nameserver $primary\" > /etc/resolvconf/resolv.conf.d/head'"
  exec_cmd "sudo bash -c 'echo \"nameserver $secondary\" >> /etc/resolvconf/resolv.conf.d/head'"
  exec_cmd "sudo resolvconf -u"
  exec_cmd "sudo service resolvconf restart"
  
  print_success "DNS configuration completed"
}
