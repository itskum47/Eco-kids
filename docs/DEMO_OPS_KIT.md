# SIH Demo Ops Kit

Last updated: 2026-04-21

## 1) Core Demo Path Lock

Required flow:
1. Student submit action
2. Teacher verify action
3. Reward appears
4. Rank moves
5. Impact updates

Verification command:

```bash
DEMO_BASE_URL=http://localhost:5001 \
DEMO_STUDENT_TOKEN=<student-jwt> \
DEMO_TEACHER_TOKEN=<teacher-jwt> \
bash scripts/demo_smoke_check.sh
```

Pass condition: all checks print [OK] and script exits 0.

## 2) Latency Target Check (p95)

```bash
DEMO_BASE_URL=http://localhost:5001 \
DEMO_STUDENT_TOKEN=<student-jwt> \
LATENCY_TARGET_MS=500 \
node scripts/latency_p95_check.js
```

Pass condition: p95 <= target for leaderboard and impact endpoints.

## 3) Failsafe Pack

Immediate fallback assets:
- Demo credentials: DEMO_CREDENTIALS.md
- Smoke check script: scripts/demo_smoke_check.sh
- Latency check script: scripts/latency_p95_check.js
- Freeze lock script: scripts/freeze-demo-tenant.sh

Recovery drill target:
- Recover any single failure in under 60 seconds by switching to backup role/account and rerunning smoke checks.

## 4) Backup Capture Checklist

- Capture screenshots for:
  - Student submission
  - Teacher approval
  - Reward timeline update
  - Leaderboard rank delta
  - Impact card update
- Capture one 90-second local video following the same sequence.

Evidence storage:
- docs/evidence/screenshots/
- docs/evidence/video/

## 5) QR + Short URL Backup Navigation

Use these short URLs in printed handout:
- Demo app: https://tinyurl.com/ecokids-demo
- Credentials: https://tinyurl.com/ecokids-demo-creds
- Repo: https://tinyurl.com/ecokids-repo

Generate QR PNGs:

```bash
npx qrcode -o docs/evidence/qr/demo-app.png "https://tinyurl.com/ecokids-demo"
npx qrcode -o docs/evidence/qr/demo-creds.png "https://tinyurl.com/ecokids-demo-creds"
npx qrcode -o docs/evidence/qr/repo.png "https://tinyurl.com/ecokids-repo"
```

## 6) Demo Scope Lock

Locked scope only:
- Learn
- Act
- Verify
- Reward
- Compete

No new feature additions allowed during demo packaging window.
