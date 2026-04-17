# Database Schema

This document summarizes core entities and high-value relationships used in EcoKids India.

## 1. Core Collections

## User
- Identity, role, profile
- Gamification state: points, level, badges, streak
- Environmental aggregates: treesPlanted, co2Prevented, waterSaved, plasticReduced, energySaved

## ActivitySubmission
- User reference
- Activity type and evidence payload
- Status lifecycle (pending -> approved/rejected variants)
- AI validation and teacher review metadata
- Impact application flag and geo metadata

## Badge / Level / CertificateTemplate
- Badge criteria and reward points
- Level thresholds and benefits
- Certificate presentation templates

## Notification
- Per-user notification messages
- Type, data payload, read state

## 2. Relationship Summary

- User 1:N ActivitySubmission
- User N:M Badge (materialized as gamification.badges array on User)
- User 1:N Notification
- User contributes to aggregate impact via environmentalImpact fields

## 3. Key Query Patterns

- Pending review queue by school + status
- Student leaderboard by gamification.ecoPoints
- Impact leaderboard by environmentalImpact metrics
- Badge eligibility from user metrics + approved activities

## 4. Existing Index Strategy (examples in models)

- User indexes:
  - gamification.ecoPoints
  - gamification.level
  - role + profile dimensions
- ActivitySubmission indexes:
  - status + createdAt
  - user + activityType + createdAt
  - school/state/district filters
  - aiValidation confidence query support

## 5. ERD (Logical)

```text
User (1) -------- (N) ActivitySubmission
  |
  | gamification.badges[]
  v
Badge

User (1) -------- (N) Notification
```

## 6. Schema Evolution Notes

Recent badge criteria extensions support quantitative evaluation fields:
- minAverageScore
- activityTypes[]
- seasonMonths[]
- windowDays
- rankScope
