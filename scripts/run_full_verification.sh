#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$DIR")"

echo "Running full verification suite..."
node "$PROJECT_ROOT/server/tests/test_worker_health.js"
node "$PROJECT_ROOT/server/tests/system_verification_test.js"

echo "SYSTEM STATUS: FULLY HARDENED"
