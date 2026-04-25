#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${DEMO_BASE_URL:-http://localhost:5001}"
STUDENT_TOKEN="${DEMO_STUDENT_TOKEN:-}"
TEACHER_TOKEN="${DEMO_TEACHER_TOKEN:-}"

if [[ -z "$STUDENT_TOKEN" || -z "$TEACHER_TOKEN" ]]; then
  echo "Missing DEMO_STUDENT_TOKEN or DEMO_TEACHER_TOKEN"
  exit 1
fi

run_check() {
  local name="$1"
  local url="$2"
  local token="$3"

  local status
  status=$(curl -sS -o /tmp/demo_smoke.json -w "%{http_code}" \
    -H "Authorization: Bearer ${token}" \
    "${BASE_URL}${url}")

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    echo "[FAIL] ${name} -> ${status}"
    cat /tmp/demo_smoke.json || true
    exit 1
  fi

  echo "[OK] ${name}"
}

run_check "Student impact" "/api/v1/impact/me" "$STUDENT_TOKEN"
run_check "Student leaderboard" "/api/v1/leaderboards/global" "$STUDENT_TOKEN"
run_check "Student rank" "/api/v1/leaderboards/my-rank" "$STUDENT_TOKEN"
run_check "Teacher queue" "/api/v1/teacher/submissions/pending?limit=5" "$TEACHER_TOKEN"
run_check "Metrics summary" "/api/reporting/metrics-summary" "$TEACHER_TOKEN"

echo "DEMO SMOKE CHECK PASSED"
