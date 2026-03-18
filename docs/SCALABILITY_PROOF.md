# Scalability Proof

This repository includes the architecture needed for horizontal scaling and queue isolation. This document captures current evidence and a reproducible load-test plan.

## 1. Current Scalability Enablers

- Stateless API routes in Express
- Queue-backed background work (BullMQ)
- Redis-backed queue/cache infrastructure
- Indexed MongoDB query patterns for high-traffic paths
- Containerized deployment assets for multi-instance rollout

## 2. High-Load Endpoints to Validate

- POST /api/v1/activity/submit and approval flows
- GET impact and leaderboard endpoints
- Teacher pending/review endpoints
- Authentication and profile fetch endpoints

## 3. Reproducible Load-Test Plan

Recommended target profile:
- 10,000 virtual users
- 5-minute test window
- 60-second ramp-up

Measurements:
- p50/p95/p99 latency
- request error rate
- API throughput
- Mongo query latency and connection saturation
- Redis memory and command latency
- worker queue depth and job age

## 4. Acceptance Thresholds

- p95 under 500ms for read-heavy endpoints
- error rate under 1%
- no sustained queue backlog growth for 15+ minutes
- no database connection exhaustion

## 5. Scaling Plan

- API: scale out via additional backend instances behind load balancer
- Worker: separate autoscaled worker pool for gamification and notifications
- Database: move to replica set and shard only after measured bottlenecks
- Cache: retain Redis with key TTL policy and leaderboard cache strategy

## 6. Evidence Artifacts to Attach After Test Run

- k6/JMeter script used
- raw latency histogram
- infra resource graphs (CPU, memory, network)
- queue depth charts
- failure and retry summary
