<div align="center">

# EcoKids India

### Learn. Play. Act for the Planet.

A multilingual, gamified environmental learning platform for Indian schools and colleges.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)
[![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)

</div>

> Pre-Launch Pilot: This platform is currently in pilot rollout mode with partner institutions. Production-scale deployment is pending pilot validation and compliance sign-off.

## Why EcoKids India
Most climate education tools are either too generic, too passive, or too disconnected from classroom reality. EcoKids India turns environmental learning into daily action loops:

- students complete activities, quizzes, and projects
- teachers verify evidence and guide quality
- schools track measurable participation
- administrators monitor adoption and impact

The result is a practical system that combines pedagogy, behavior design, and accountability.

## What Makes It Different

### 1. Action-First Learning
- activity submissions with evidence photos
- teacher approval and feedback workflows
- points, streaks, levels, and badges

### 2. India-Ready Localization
- support for 10 Indian languages
- grade-adaptive UX for different age bands
- offline-safe flows for unstable connectivity

### 3. Compliance-Aware Architecture
- parental consent enforcement for minors via route-level middleware
- immutable audit-style logging for sensitive actions
- school-level privacy controls and governance settings

### 4. Multi-Tenant by Design
- school isolation enforced in API middleware
- admin surfaces at school, district, and state layers
- leaderboard and reporting boundaries across institutional levels

## New Capabilities (Latest Build)

### Consent Hardening
- minors are blocked from protected learning routes unless parental consent is approved
- consent checks use cache-backed middleware for performance

### Leaderboard Privacy
- anonymized leaderboard identities for safer public ranking views
- no raw email exposure in leaderboard payloads

### Appeal Workflow
- students can dispute rejected submissions
- teachers can resolve appeals with reasoned decisions

### Eco-Anxiety Sensitivity Layer
- content can be marked as standard, sensitive, or distressing
- framing statements and action items reduce doom fatigue
- school settings can cap max sensitivity level

### Teacher Verification Anomaly Detection
- rate limits for approval bursts
- audit log model for approval/rejection actions
- suspicious approval ratio endpoint for state admins

### Undergraduate Track (College Experience)
- campus chapter model with missions and member voting
- research track submissions with GPS, photo evidence, and structured write-up
- faculty advisor role support
- career pathways component mapping eco-badges to green careers

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query |
| Backend | Node.js, Express, JWT, BullMQ |
| Database | MongoDB + Mongoose |
| Caching/Queues | Redis + BullMQ workers |
| Monitoring | Prometheus, Alertmanager, Grafana |
| Deployment | Docker, Nginx, Kubernetes (Helm) |

## Repository Structure

```text
ecokids-india/
├── client/                 # Frontend app (React + Vite)
├── server/                 # Backend API (Express + Mongoose)
├── mobile/                 # Mobile client
├── docs/                   # Product + operations docs
├── monitoring/             # Prometheus/Grafana configs
├── k8s/                    # Helm chart + manifests
├── docker-compose.yml      # Local stack
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Redis (for cache and queue features)

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
Create your server env file at server/.env with at least:

```bash
MONGODB_URI=mongodb://localhost:27017/ecokids-india
JWT_SECRET=replace-with-a-long-random-secret
PORT=5001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

### 3. Run in development

```bash
npm run dev
```

This runs backend and frontend concurrently.

### 4. Optional seed

```bash
npm run seed
```

## Useful Commands

```bash
npm run dev            # run server + client
npm run build          # build frontend
npm run server         # run backend only
npm run client         # run frontend only
npm run check:queries  # query safety checks
```

## Core API Areas (v1)

- auth and identity
- consent and privacy
- activities and verification
- quizzes and lessons
- leaderboards and gamification
- school, district, and state administration
- content reporting and moderation
- campus chapters and research track

## Security and Compliance Snapshot

| Area | Current Status |
|---|---|
| DPDP Act 2023 | Implemented at route-level for protected student flows; final legal sign-off pending |
| RTE-aligned controls | Implemented in onboarding and student governance flows |
| RBAC | Implemented across student, teacher, faculty advisor, and admin roles |
| Auditability | Action logs and approval audit trails implemented |
| Data boundaries | School isolation middleware active in scoped routes |

## Demo and Operations Docs

- [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)
- [PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md)
- [COMPLIANCE_CHECKLIST.md](COMPLIANCE_CHECKLIST.md)
- [docs/DEMO_README.md](docs/DEMO_README.md)
- [docs/RUNBOOK.md](docs/RUNBOOK.md)

## Contributing

1. Create a feature branch
2. Make focused commits
3. Run build and tests locally
4. Open a PR with scope, risk, and verification notes

## License
MIT

---
Built for classrooms, designed for real-world climate action.
