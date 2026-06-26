#!/usr/bin/env bash
# Generates .env from .env.example, replacing placeholder values for
# POSTGRES_PASSWORD, JWT_SECRET, and JWT_REFRESH_SECRET with random secrets.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
EXAMPLE="$ROOT_DIR/.env.example"
OUTPUT="$ROOT_DIR/.env"

if [[ -f "$OUTPUT" ]]; then
  read -r -p ".env already exists. Overwrite? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

gen_secret() {
  # 48 random bytes → 64-char hex string
  openssl rand -hex 48
}

POSTGRES_PASSWORD=$(gen_secret)
JWT_SECRET=$(gen_secret)
JWT_REFRESH_SECRET=$(gen_secret)

sed \
  -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD='${POSTGRES_PASSWORD}'|" \
  -e "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" \
  -e "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|" \
  "$EXAMPLE" > "$OUTPUT"

echo ".env generated at $OUTPUT"
echo "  POSTGRES_PASSWORD : ${POSTGRES_PASSWORD:0:8}…"
echo "  JWT_SECRET        : ${JWT_SECRET:0:8}…"
echo "  JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:0:8}…"
