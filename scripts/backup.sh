#!/usr/bin/env bash
set -euo pipefail

# ── EcoKids India — MongoDB Backup Script ──
# Usage: bash scripts/backup.sh
# Env: MONGO_URI, BACKUP_S3_BUCKET, AWS_DEFAULT_REGION, SLACK_WEBHOOK_URL

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/ecokids-backup-${TIMESTAMP}"
BACKUP_FILE="ecokids-${TIMESTAMP}.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
S3_BUCKET="${BACKUP_S3_BUCKET:-ecokids-backups}"
MONGO_URI="${MONGO_URI:?MONGO_URI is required}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
notify_slack() {
  if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"$1\"}" > /dev/null 2>&1 || true
  fi
}

cleanup() {
  rm -rf "$BACKUP_DIR" "/tmp/${BACKUP_FILE}" 2>/dev/null || true
}
trap cleanup EXIT

# ── Step 1: Dump ──
log "Starting MongoDB backup..."
mkdir -p "$BACKUP_DIR"

mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR" --gzip --quiet

if [ $? -ne 0 ]; then
  log "❌ mongodump failed"
  notify_slack "🔴 EcoKids backup FAILED at mongodump step (${TIMESTAMP})"
  exit 1
fi

DUMP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "✅ Dump complete (${DUMP_SIZE})"

# ── Step 2: Compress ──
tar -czf "/tmp/${BACKUP_FILE}" -C "$BACKUP_DIR" .

# ── Step 3: Upload to S3 ──
if command -v aws &> /dev/null; then
  aws s3 cp "/tmp/${BACKUP_FILE}" "s3://${S3_BUCKET}/daily/${BACKUP_FILE}" \
    --storage-class STANDARD_IA \
    --sse AES256 \
    --quiet

  if [ $? -ne 0 ]; then
    log "❌ S3 upload failed"
    notify_slack "🔴 EcoKids backup FAILED at S3 upload step (${TIMESTAMP})"
    exit 1
  fi

  log "✅ Uploaded to s3://${S3_BUCKET}/daily/${BACKUP_FILE}"

  # ── Step 4: Enforce retention ──
  CUTOFF_DATE=$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)
  OLD_FILES=$(aws s3 ls "s3://${S3_BUCKET}/daily/" | awk "\$1 < \"${CUTOFF_DATE}\" {print \$4}" || true)

  if [ -n "$OLD_FILES" ]; then
    echo "$OLD_FILES" | while read -r file; do
      aws s3 rm "s3://${S3_BUCKET}/daily/${file}" --quiet
      log "🗑️ Deleted old backup: ${file}"
    done
  fi
else
  log "⚠️ AWS CLI not found. Backup saved locally at /tmp/${BACKUP_FILE}"
fi

# ── Step 5: Integrity check ──
log "Verifying backup integrity..."
VERIFY_DIR="/tmp/ecokids-verify-${TIMESTAMP}"
mkdir -p "$VERIFY_DIR"
tar -xzf "/tmp/${BACKUP_FILE}" -C "$VERIFY_DIR"

COLLECTION_COUNT=$(find "$VERIFY_DIR" -name "*.bson.gz" | wc -l)
if [ "$COLLECTION_COUNT" -lt 5 ]; then
  log "❌ Integrity check failed: only ${COLLECTION_COUNT} collections found"
  notify_slack "🔴 EcoKids backup integrity check FAILED (${TIMESTAMP}): only ${COLLECTION_COUNT} collections"
  rm -rf "$VERIFY_DIR"
  exit 1
fi

rm -rf "$VERIFY_DIR"
log "✅ Integrity verified: ${COLLECTION_COUNT} collections"

# ── Done ──
FINAL_SIZE=$(du -sh "/tmp/${BACKUP_FILE}" | cut -f1)
log "✅ Backup complete: ${BACKUP_FILE} (${FINAL_SIZE})"
notify_slack "✅ EcoKids backup successful: ${BACKUP_FILE} (${FINAL_SIZE}, ${COLLECTION_COUNT} collections)"
