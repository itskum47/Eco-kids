#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE=".local/demo-tenant-freeze.lock"
mkdir -p .local

echo "frozen_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$LOCK_FILE"
echo "actor=${USER:-unknown}" >> "$LOCK_FILE"

echo "Demo tenant frozen. Lock file: ${LOCK_FILE}"

cat <<'EOF'
Recommended policy after freeze:
1. Do not run seed scripts against demo tenant.
2. Only run read-only verification scripts.
3. Record any emergency data mutation in docs/DEMO_EVIDENCE_PACK.md.
EOF
