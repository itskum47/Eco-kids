#!/bin/bash
cd "$(dirname "$0")"
echo "Creating demo users..."
node quick-fix-users.js
