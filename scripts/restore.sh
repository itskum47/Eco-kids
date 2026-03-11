#!/usr/bin/env bash
set -euo pipefail

# ── EcoKids India — MongoDB Restore Script ──
# Usage: bash scripts/restore.sh <backup-file-or-s3-path>
# Examples:
#   bash scripts/restore.sh /tmp/ecokids-20240301_120000.gz
#   bash scripts/restore.sh s3://ecokids-backups/daily/ecokids-20240301_120000.gz

BACKUP_SOURCE="${1:?Usage: restore.sh <backup-file-or-s3-path>}"
MONGO_URI="${MONGO_URI:?MONGO_URI is required}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESTORE_DIR="/tmp/ecokids-restore-${TIMESTAMP}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

cleanup() {
  rm -rf "$RESTORE_DIR" "/tmp/restore-download-${TIMESTAMP}.gz" 2>/dev/null || true
}
trap cleanup EXIT

# ── Step 1: Download if S3 path ──
if [[ "$BACKUP_SOURCE" == s3://* ]]; then
  log "Downloading from S3: ${BACKUP_SOURCE}"
  LOCAL_FILE="/tmp/restore-download-${TIMESTAMP}.gz"
  aws s3 cp "$BACKUP_SOURCE" "$LOCAL_FILE" --quiet
  BACKUP_SOURCE="$LOCAL_FILE"
  log "✅ Downloaded"
fi

# ── Step 2: Validate file ──
if [ ! -f "$BACKUP_SOURCE" ]; then
  log "❌ Backup file not found: ${BACKUP_SOURCE}"
  exit 1
fi

FILE_SIZE=$(du -sh "$BACKUP_SOURCE" | cut -f1)
log "Backup file: ${BACKUP_SOURCE} (${FILE_SIZE})"

# ── Step 3: Extract ──
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_SOURCE" -C "$RESTORE_DIR"

COLLECTION_COUNT=$(find "$RESTORE_DIR" -name "*.bson.gz" | wc -l)
log "Found ${COLLECTION_COUNT} collections in backup"

if [ "$COLLECTION_COUNT" -lt 5 ]; then
  log "❌ Backup appears corrupt: only ${COLLECTION_COUNT} collections"
  exit 1
fi

# ── Step 4: Confirmation ──
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ⚠️  WARNING: This will OVERWRITE the database  ║"
echo "║  Target: ${MONGO_URI}                            "
echo "║  Collections: ${COLLECTION_COUNT}                "
echo "║  Source: ${BACKUP_SOURCE}                        "
echo "╚══════════════════════════════════════════════════╝"
echo ""
read -p "Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
  log "❌ Restore cancelled"
  exit 1
fi

# ── Step 5: Restore ──
log "Starting restore..."

mongorestore --uri="$MONGO_URI" --gzip --drop "$RESTORE_DIR"

if [ $? -ne 0 ]; then
  log "❌ mongorestore failed"
  exit 1
fi

# ── Step 6: Verify ──
log "Verifying restore..."
DB_NAME=$(echo "$MONGO_URI" | sed -n 's/.*\/\([^?]*\).*/\1/p')
RESTORED_COUNT=$(mongosh "$MONGO_URI" --quiet --eval "db.getCollectionNames().length" 2>/dev/null || echo "unknown")
log "✅ Restore complete: ${RESTORED_COUNT} collections in ${DB_NAME}"

# ── RTO tracking ──
END_TIME=$(date +%s)
log "Restore finished at $(date)"
