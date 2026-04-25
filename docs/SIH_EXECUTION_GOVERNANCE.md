# SIH Execution Governance

## Stop Rule After Day 10
Only allowed after Day 10:
- Stabilization
- Reliability fixes
- Demo packaging artifacts

Not allowed after Day 10:
- New feature development
- Contract-breaking API changes

## Owners Matrix
- Architect/API authority: school.admin@dps-del.ecokids.in
- Frontend demo path owner: teacher1@dps-del.ecokids.in
- Backend verification owner: admin@dps-del.ecokids.in
- Realtime/reliability owner: district.admin@ecokids.in
- Demo captain: state.admin@ecokids.in

## Daily Red-Flag Review
Run daily standup with these blocks:
1. Demo path green/red
2. P0 and P1 blockers
3. Latency status (p95)
4. Rehearsal readiness
5. Failsafe readiness

Override authority: demo captain can block merges that break demo path.

## One-Page Daily Scorecard Template
- Demo path: PASS/FAIL
- Open P0/P1 count
- p95 leaderboard latency
- p95 impact latency
- Rehearsal run result
- Failsafe drill time-to-recover

## Demo Tenant Freeze
Freeze command:

```bash
bash scripts/freeze-demo-tenant.sh
```

Verification command:

```bash
bash scripts/check-demo-tenant-frozen.sh
```
