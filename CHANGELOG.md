# Changelog

All notable changes to EcoKids India are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — Pre-Launch Pilot Phase

> Platform is in pre-launch pilot phase. Changes below represent engineering hardening before school onboarding.

### Fixed

- **Offline sync endpoint mismatch** (`client/public/sw.js`): Service worker was posting to `/api/activity/submit` (wrong). Fixed to `/api/v1/activity/submit` to match Express mount point. Added server rejection logging for non-2xx responses to detect silent sync failures.
- **Leaderboard field references** (`server/routes/leaderboards.js`): All broken field references (`firstName`, `lastName`, `ecoPoints` at root level) replaced with correct User model paths (`name`, `gamification.ecoPoints`, `gamification.level`, `gamification.streak.current`).

### Added

**DPDP Act 2023 — Route-Level Consent Enforcement**
- Rewrote `server/middleware/requireConsent.js`: now queries the `ParentalConsent` MongoDB collection (`studentId`, `consentStatus: 'approved'`) instead of checking `onboardingCompleted` flag.
- Redis cache key `consent:{userId}` with 15-minute TTL prevents a DB hit on every request.
- Threshold changed from age < 13 to age < 18 per DPDP Act Section 9 (all minors).
- Consent gate applied to: `POST /api/v1/lessons/:id/complete`, `POST /api/v1/quizzes/:id/start|submit-answer|complete`, all `/api/v1/leaderboards` reads.
- Returns `HTTP 403` with `{ error: 'CONSENT_REQUIRED', consentUrl: '/consent/pending' }`.

**Leaderboard Anonymization**
- Added `anonymizeEntry()` in `server/routes/leaderboards.js`: hashes user MongoDB `_id` with `LEADERBOARD_ID_SALT` env var (SHA-256, hex sliced to 16 chars) for public display IDs.
- User display names truncated to first name + last initial (`Arjun S.`).
- Email fields removed from all leaderboard API responses.
- Applies to global, school, district, and personal-rank endpoints.

**Eco-Anxiety Content Sensitivity System**
- Added fields to `Quiz` model: `sensitivity_level` (standard/sensitive/distressing), `framing_statement`, `action_items` (max 3), `teacher_facilitation_note`.
- Added `max_sensitivity_level` to `School` model so schools can cap content intensity.
- School settings GET/PATCH routes updated to expose `max_sensitivity_level`.
- `LessonDetail.jsx`: dismissible distressing-content warning banner, framing statement display, "What you can do" action items card.

**Teacher Approval Anomaly Detection**
- New model `server/models/ApprovalAuditLog.js`: immutable audit trail for every teacher and AI approval/rejection with `action_source` (`teacher` | `ai_auto`).
- Redis sorted-set rate limiter in `verifyActivity`: teachers are blocked at 15 approvals per 10-minute window (`APPROVAL_RATE_LIMIT`/`APPROVAL_RATE_WINDOW`).
- Fire-and-forget `ApprovalAuditLog.create()` after every approval and rejection path.
- State admin endpoint: `GET /api/v1/state-admin/suspicious-approvals` — returns teachers with approval ratio > 95% and > 50 approvals in the last 7 days.
- New `server/queues/aiVerificationQueue.js` and `server/workers/aiVerificationWorker.js`: AI auto-approvals write to `ApprovalAuditLog` with `teacher_id: null`.

**College / Undergraduate UX Differentiation**
- `User` model: added `faculty_advisor` to `role` enum; added UG grade levels (`ug1`–`ug4`) to `profile.grade` enum; added `profile.institutionType` field (`school` | `college` | `university`).
- `ActivitySubmission` model: added `research-track` to `activityType` enum; added `researchTrack` subdocument (GPS coordinates, write-up, word count, faculty advisor ref).
- `Quiz` model: added `campus-action` to `category` enum.
- New `CampusChapter` model (`server/models/CampusChapter.js`): student-led chapters with members, missions (proposed/pending_review/active/archived), and per-mission voting.
- New routes `server/routes/campusChapters.js`: create chapter, join, propose mission, vote on mission, chapter leaderboard, research track submission (150–300 word write-up + GPS + ≥3 photos). UG-only guards on create/join/research-track.
- Mounted at `GET|POST /api/v1/campus-chapters`.
- Frontend: `CampusChapterHub.jsx` (browse/create/join chapters, propose missions, leaderboard modal), `ResearchTrackSubmit.jsx` (GPS detection, word counter, photo URL inputs), `CareerPathways.jsx` (static badge → green career mapping, UG-only).

### Changed

- `COMPLIANCE_CHECKLIST.md`: DPDP row updated to reflect `requireConsent.js` implementation; implementation notes added; pre-launch pilot status noted.
- `README.md`: Pre-launch pilot notice added under platform tagline; Parental Consent System description updated to accurately reflect route-level enforcement; RBAC role count updated (4 → 7).

---

## Notes

- `LEADERBOARD_ID_SALT` environment variable must be set in production for leaderboard anonymization.
- `requireConsent` middleware requires a `ParentalConsent` collection with documents using `studentId` (not `userId`) and `consentStatus: 'approved'`.
- Campus Chapter and Research Track features require `profile.institutionType` or `profile.grade` (ug1–ug4) to be set on student user records.
