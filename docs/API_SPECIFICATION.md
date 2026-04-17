# API Specification (Core Subset)

Base path in current backend is mounted under versioned routes where applicable.

## 1. Activity Submission

### POST /api/v1/activity/submit
- Auth: required
- Purpose: submit evidence for environmental activity
- Request (multipart/form-data):
  - activityType (string)
  - description (string)
  - latitude, longitude (number, optional)
  - file (image, required)
- Response:
  - 201 with created submission object
  - 400/409 for validation or duplication checks
  - 429 for cooldown/rate-based limits

## 2. Teacher Review

### PATCH /api/v1/activity/verify/:submissionId
- Auth: teacher/admin
- Body:
  - status: approved | rejected
  - rejectionReason (required for reject)
- Behavior:
  - approved -> environmental impact increments + points + badge evaluation
  - rejected -> audit and feedback flow

## 3. Impact APIs

### GET /api/impact/me
- Auth: required
- Returns:
  - environmentalImpact aggregate
  - real-world equivalent metrics

### GET /api/impact/me/history
- Auth: required
- Returns chart-oriented impact trend data

### GET /api/impact/leaderboard
- Auth: public
- Query: metric, limit, offset
- Returns ranked students by selected impact metric

### GET /api/impact/global
- Auth: public
- Returns system-wide impact totals

## 4. Badge/Gamification Evaluation Trigger

Badge checks run when points are awarded after approval paths and rely on:
- user gamification aggregates
- user environmental aggregates
- approved activity history

## 5. Error Contract (Common)

- 200 OK
- 201 Created
- 400 Validation error
- 401 Unauthorized
- 403 Forbidden
- 404 Not found
- 409 Conflict
- 429 Too many requests
- 500 Server error

## 6. OpenAPI Upgrade Path

For evaluator submission, convert this doc into OpenAPI 3.0 YAML including:
- schemas for UserImpact, ActivitySubmission, BadgeAward
- enum definitions for activityType and submission statuses
- reusable error response component
