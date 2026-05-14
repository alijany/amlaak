#!/usr/bin/env bash

set -euo pipefail

build_ssh_target() {
  local user="$1"
  local host="$2"
  printf '%s@%s\n' "$user" "$host"
}

ssh_base_args() {
  local port="$1"
  local identity_file="$2"
  local -a args=(-p "$port" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)

  if [[ -n "$identity_file" ]]; then
    args+=(-i "$identity_file")
  fi

  printf '%s\n' "${args[*]}"
}

run_ssh_cmd() {
  local ssh_target="$1"
  local port="$2"
  local identity_file="$3"
  local remote_cmd="$4"

  local ssh_args
  ssh_args="$(ssh_base_args "$port" "$identity_file")"
  # shellcheck disable=SC2086
  ssh $ssh_args "$ssh_target" "$remote_cmd"
}

run_scp_copy() {
  local source_path="$1"
  local destination="$2"
  local port="$3"
  local identity_file="$4"

  local -a args=(-P "$port" -o StrictHostKeyChecking=accept-new)
  if [[ -n "$identity_file" ]]; then
    args+=(-i "$identity_file")
  fi

  scp "${args[@]}" "$source_path" "$destination"
}
