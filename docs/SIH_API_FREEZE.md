# SIH API Freeze: Canonical Contract and Scoring Authority

Last updated: 2026-04-20
Status: Frozen for SIH demo path stabilization

## 1) Canonical API Prefix and Envelope

Canonical prefix:
- `/api/v1/*`

Standard response envelope:
- Success:
  - `success: true`
  - `data: <payload>` (or documented alternative fields where legacy compatibility is required)
- Error:
  - `success: false`
  - `message: <human readable reason>`
  - Optional: `errors`, `code`, `details`

Stabilization rule:
- New endpoints must ship only under `/api/v1`.
- Existing non-canonical aliases remain read-compatible only when needed for backward compatibility and are tracked in the deprecation table below.

## 2) Demo-Critical Route Map (Frozen)

Learn -> Act -> Verify -> Reward -> Compete

Learn:
- `GET /api/v1/content/*`
- `GET /api/v1/learning/*`

Act:
- `POST /api/v1/submissions`
- `POST /api/v1/impact/daily-action`
- `GET /api/v1/impact/me/metrics`

Verify:
- `GET /api/v1/teacher/submissions/pending`
- `POST /api/v1/teacher/submissions/:id/review`
- `POST /api/v1/teacher/activities/batch-approve`

Reward:
- `GET /api/v1/rewards/*`
- `POST /api/v1/store/redeem`
- `GET /api/v1/users/me/rewards` (or equivalent profile/reward timeline endpoint)

Compete:
- `GET /api/v1/leaderboards`
- `GET /api/v1/leaderboards/school`
- `GET /api/v1/leaderboards/district`
- `GET /api/v1/leaderboards/my-rank`

Reliability/Realtime support:
- `POST /api/v1/teacher/realtime/manual-trigger`
- `GET /api/v1/teacher/realtime/rank-history/:userId`

## 3) Scoring Authority Spec (Frozen)

Single score authority formula:

`score = verified_points + impact_bonus + consistency_bonus - fraud_penalty`

Definitions:
- `verified_points`: points awarded only after verified/approved actions.
- `impact_bonus`: additive bonus from validated impact metrics.
- `consistency_bonus`: streak/continuity bonus from sustained verified participation.
- `fraud_penalty`: deterministic deductions from anti-abuse/fraud controls.

Integration points (authoritative):
- Verification decision points in teacher review flows.
- Approved activity pipelines and reward ledger writes.
- Leaderboard read service (`leaderboardService`) for canonical rank reads.
- Anti-abuse risk checks in redemption flows and suspicious submission handling.

Guardrails:
- Client-origin rank/points mutation events are non-authoritative.
- Realtime can notify but not author score truth.
- Audit trail must preserve rank transitions and decision provenance.

## 4) Deprecation Table

| Legacy/Alt Path | Canonical Path | Status | Notes |
|---|---|---|---|
| `/api/v1/users/leaderboard` | `/api/v1/leaderboards` (+ scoped endpoints) | Deprecated (read-compatible) | Backed by centralized leaderboard service for consistency |
| Any non-`/api/v1` impact aliases | `/api/v1/impact/*` | Deprecated | Keep only if required by existing clients during SIH demo window |
| Direct client rank mutation socket events | Server-emitted `leaderboard-update` only | Blocked | Server now rejects client rank/points mutation events |

## 5) Change Control for SIH Window

Allowed:
- Bug fixes
- Contract-preserving reliability fixes
- Fallback/observability hardening
- Demo packaging

Blocked:
- Net-new feature expansion not required for demo path
- Contract-breaking schema/route changes
- Additional non-core navigation surfaces

## 6) Verification Checklist

- [x] Canonical leaderboard reads centralized in service layer
- [x] Demo-critical paths use `/api/v1`
- [x] Rank transition history endpoint present for replay/audit
- [x] Signed rank transition metadata captured in audit logs
- [x] Impact aggregation endpoints cached with invalidation on writes
