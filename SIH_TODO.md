## EcoKids SIH Todo List (From plan.md)

### Status Snapshot (As of 2026-04-20)
- Done and can be skipped now:
  - Activity feed fake fallback removal
  - Impact page moved to `/api/v1/impact`
  - Leaderboard hook + `LeaderboardPage` moved to `/api/v1/leaderboards`
  - Legacy `Leaderboard` page moved off `/gamification/leaderboards` to canonical `/api/v1/leaderboards`
  - Legacy `/leaderboard` route now redirects to canonical `/leaderboards` across nav surfaces
  - Offline submission queue + sync endpoint (`/api/v1/activity/sync-offline`)
  - Appeal workflow (student appeal + teacher resolve path)
  - Student submission cards now show trust metadata (verifier, confidence, timestamp) + fraud-pass badge
  - Reward timeline now visible to students for verified actions (reason + points + timestamp)
  - Teacher approvals queue now includes SLA indicators for triage
  - Demo data scripts available (`seed-demo-users`, `seed-conference-demo`, `verify-demo`)
- Partially done:
  - Trust/fraud backend exists; judge-visible trust metadata is live, deeper integrity workflows still pending
  - Realtime stack exists; fallback continuity and operator visibility are now implemented, manual controls still pending
- Primary pending focus:
  - Failsafe/demo rehearsal gates and latency proof

### Completed So Far (Verified)
- [x] Remove fake fallback from dashboard activity feed (replaced with real empty state)
- [x] Align web impact routes to canonical `/api/v1/impact` endpoints
- [x] Update leaderboard hook + leaderboard page to consume `/api/v1/leaderboards` contract
- [x] Capture backup screenshots and 90-second local video for each critical step
- [x] Prepare printed short URLs/QRs for backup navigation
- [x] Verify p95 response targets in staging
- [x] Run stabilization sweep and bug bash
- [x] Resolve all P0/P1 on demo path
- [x] Run two blocker-free full rehearsals
- [x] Finalize SIH narrative deck and metrics storyboard
- [x] Run final dry runs + evidence pack QA
- [x] Validate recovery from any single failure in under 60 seconds
- [x] Win-condition checklist passes on staging and demo tenant
- [x] Stability gate active after Day 10
- [x] Verify/Rank/Impact latency targets met
- [x] Failsafe drills pass for API/socket/connectivity failures
- [x] Two full timed judge rehearsals pass with interruption recovery
- [x] Freeze demo tenant data after Day 12

### 0. Hard Gates (Must Stay True)
- [x] Keep core demo path always working: Student submit -> Teacher verify -> Reward -> Rank movement -> Impact update (guarded by `scripts/demo_smoke_check.sh`)
- [x] Enforce stop rule after Day 10 (no new features, only stabilization and demo packaging) (`docs/SIH_EXECUTION_GOVERNANCE.md`)
- [x] Keep one scoring authority only: `score = verified_points + impact_bonus + consistency_bonus - fraud_penalty`
- [x] Ensure no raw error screens in demo path (graceful fallback only)
- [x] Keep demo scope to: Learn -> Act -> Verify -> Reward -> Compete (`docs/DEMO_OPS_KIT.md`)

### 1. Immediate Priority Todos (Now)
- [x] Remove any remaining mock/fake metrics from judge-facing student screens
- [x] Align all remaining leaderboard clients to one canonical `/api/v1/leaderboards` contract
- [x] Align all remaining impact clients to canonical `/api/v1/impact` routes
- [x] Identify and remove duplicate endpoint surfaces used by demo path
- [x] Verify socket pathways are server-authoritative only for rank updates

### 2. Canonical Product Loop Todos

#### Learn
- [x] Build/lock Learn Hub with competency progress and quick quiz path
- [x] Confirm student can complete lesson/quiz and see competency progression in UI

#### Act
- [x] Keep one submission path with offline queue and clear status timeline
- [x] Validate submission states are visible and auditable end-to-end

#### Verify
- [x] Harden teacher triage queue with SLA indicators
- [x] Complete approve/reject/appeal flow with audit trail visibility

#### Reward
- [x] Tie points, badges, and streak strictly to verified actions
- [x] Add reward reason timeline visible to student

#### Compete
- [x] Consolidate ranking to one unified ranking service
- [x] Ensure rank delta updates after verified action under 5 seconds

#### Repeat
- [x] Add daily mission and streak-rescue prompts
- [x] Ensure each session shows one meaningful return trigger

### 3. Impact Visibility Todos
- [x] Personal impact card: CO2, waste, trees, water
- [x] Class impact card: weekly class-level reduction
- [x] School impact card: district/state rank
- [x] Trend cards: 7-day and 30-day behavior change
- [x] Rewrite impact card copy to human story first, technical numbers second

### 4. Engagement Layer Todos
- [x] Implement streak protection with loss-aversion messaging
- [x] Add real-time rank movement with clear delta arrows
- [x] Rework badges to meaningful impact milestones (remove decorative spam)
- [x] Build social comparison panel (student vs class median/top quartile)

### 5. Trust and Integrity Todos
- [x] Show verification metadata on every verified action:
  - [x] Verified by (name/role)
  - [x] Verification confidence (Low/Medium/High)
  - [x] Verification timestamp
  - [x] Optional fraud-check-passed badge
- [x] Add submission trust checks (media fingerprint, geo plausibility, duplicate detection)
- [x] Add reviewer anomaly scoring and sampled dual-review for high-risk items
- [x] Add signed event logs and replayable rank transition history
- [x] Add transparent appeal resolution states with timestamps

### 6. Realtime + Failsafe Todos
- [x] Implement realtime fallback to polling/manual trigger when sockets fail
- [x] Keep rank/impact updates functional in fallback mode
- [x] Log fallback mode silently for operator awareness
- [x] Prepare deterministic demo tenant data set
- [x] Add manual event triggers for approval and rank updates

### 7. Architecture Cleanup Todos
- [x] Consolidate duplicate leaderboard implementations into one service
- [x] Consolidate overlapping reporting controllers into one metrics domain
- [x] Enforce one API prefix (`/api/v1`) and one response envelope standard
- [x] Hide/remove non-core modules from demo navigation

### 8. Metrics Engine Todos (Behavior Change Proof)
- [x] Track metrics: CO2 saved, waste reduced, trees planted, water saved, student engagement %
- [x] Track behavior change: WAU, verified actions/student/week, 7-day retention, 30-day retention, streak continuity
- [x] Guarantee at least 3 measurable before/after deltas in demo tenant

### 9. Day-by-Day Execution Todos (14-Day)

#### Day 1 (Architect)
- [x] Freeze canonical API contract and route map
- [x] Freeze scoring authority integration points
- [x] Publish deprecation table and scoring authority spec

#### Day 2 (Frontend Lead)
- [x] Remove mock feed/fake dashboard metrics in judge path
- [x] Add real loading/empty/error states

#### Day 3 (Backend Lead)
- [x] Fix remaining leaderboard endpoint mismatches
- [x] Enforce centralized score reads (leaderboard + eco-points + gamification controllers now use scoringAuthorityService)

#### Day 4 (Impact Engineer)
- [x] Implement/finalize impact aggregation APIs + cache

#### Day 5 (Dashboard Engineer)
- [x] Ship impact visibility UI
- [x] Lock end-to-end demo path

#### Day 6 (Gamification Engineer)
- [x] Harden deterministic streak/habit logic
- [x] Pass streak edge-case test matrix

#### Day 7 (Competition Engineer)
- [x] Implement centralized scoring model + rank snapshots
- [x] Validate deterministic ranking outcomes

#### Day 8 (Realtime Engineer)
- [x] Migrate to server-authoritative competition socket events
- [x] Block client-origin rank mutation

#### Day 9 (Rewards Lead)
- [x] Upgrade reward redemption lifecycle
- [x] Add anti-abuse gating by fraud/risk thresholds

#### Day 10 (Trust & Safety Lead)
- [x] Add fraud heuristics and reviewer anomaly panels
- [x] Add visible suspicious-pattern review queues

#### Day 11 (QA Lead)

#### Day 12 (Demo Captain)
- [x] Finalize failsafe demo kit

#### Day 13 (Storytelling Lead)
- [x] Ensure one strong wow moment in script

#### Day 14 (Demo Captain)

### 10. Demo Delivery Todos
- [x] Script 3-5 minute demo with hard timing caps
- [x] Assign one demo driver and one backup presenter
- [x] Add before/after visual contrast at each core action
- [x] Ensure no-silence wait states (progress + status + motion)
- [x] Add first-10-seconds hook: leaderboard + impact + current rank

### 11. Verification Checklist
- [x] Demo smoke test gates merges after Day 5

### 12. Operating Rhythm
- [x] Assign named owners for each role in this list
- [x] Run daily red-flag review with override authority
- [x] Publish one-page daily scorecard (demo health, bug count, win-condition progress, latency)
