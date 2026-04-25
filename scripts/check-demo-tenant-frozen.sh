#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE=".local/demo-tenant-freeze.lock"

if [[ ! -f "$LOCK_FILE" ]]; then
  echo "Demo tenant is NOT frozen"
  exit 1
fi

echo "Demo tenant freeze lock present:"
cat "$LOCK_FILE"
