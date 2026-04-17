# Architecture

## 1. System Overview

EcoKids India is implemented as a multi-client EdTech platform with shared backend services.

- Web client: React + Vite app in client/
- Mobile client: React Native app in mobile/
- Backend API: Express app in server/
- Data store: MongoDB via Mongoose models
- Async processing: BullMQ queues and workers
- Monitoring: Prometheus/Grafana config in monitoring/
- Deployment assets: Docker compose, Nginx, Kubernetes Helm chart

```text
Web (React) / Mobile (React Native)
            |
         HTTPS
            |
      Express API (server/server.js)
            |
  -------------------------------------
  |            |            |          |
MongoDB     Redis       Queue jobs   Storage service
(Mongoose) (cache)      (BullMQ)     (upload abstraction)
```

## 2. Backend Layering

- Route layer: server/routes/
- Controller layer: server/controllers/
- Service layer: server/services/
- Model layer: server/models/
- Worker layer: server/workers/

Key flow (activity submission):
1. Client submits evidence.
2. Controller validates payload and anti-fraud checks.
3. Submission persisted as ActivitySubmission.
4. AI verification and review workflows triggered.
5. Teacher approval applies impact + points + badge evaluation.

## 3. Key Design Decisions

- MongoDB: flexible schema for heterogeneous activities and evidence metadata.
- BullMQ: decouples heavy gamification and background jobs from API latency.
- Redis: used for queue connection and cache-oriented operations.
- Feature flags: staged rollout support via server/config/featureFlags.js.

## 4. Runtime and Infrastructure Assets in Repo

- Docker: docker-compose.yml and production/monitoring variants
- Nginx reverse proxy: nginx/nginx.conf
- Kubernetes packaging: k8s/helm/ecokids/
- Monitoring: Prometheus rules + Grafana dashboards

## 5. Traceability to Evaluation Criteria

- Gamification and scoring: server/services/gamificationService.js, server/utils/badgeEngine.js
- Impact computation: server/utils/impactCalculator.js
- Teacher verification workflow: server/controllers/activityController.js
- Role-based routing and middleware: server/middleware/ and route guards
