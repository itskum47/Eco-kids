<div align="center">

# EcoKids India V2

### Learn Better. Live Greener. Build Real Climate Habits.

A multilingual, gamified environmental education platform for schools and colleges in India.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)

</div>

> Status: Pre-launch pilot. Core platform is production-oriented, with rollout gated by partner validation and compliance sign-off.

## Why This Project Exists
EcoKids India converts environmental education from passive reading into measurable action:

- Students complete real tasks with evidence
- Teachers verify quality and authenticity
- Schools track participation and impact
- Admins monitor compliance and adoption

The result is a practical loop of learning, action, and accountability.

## What Makes It Strong

### 1. Real-World Action Workflow
- Activity submissions with media evidence
- Teacher verification and appeal flow
- Points, badges, levels, and streaks

### 2. India-First Experience
- Support for 10 Indian languages
- School governance layers (school, district, state)
- Mobile-aware and low-connectivity-friendly flows

### 3. Governance and Safety
- Role-based access controls across platform surfaces
- Consent-aware student route protection
- Audit-ready operational and compliance documentation

### 4. Scalable Engineering Base
- Web + mobile clients
- Queue-backed backend workflows
- Clean service-oriented backend layout

## Architecture Snapshot

```text
Web (React/Vite) + Mobile (Expo)
        |
        v
API Layer (Node.js/Express)
        |
        +--> MongoDB (core data)
        +--> Redis + BullMQ (cache/queues)
        +--> Appwrite integrations (functions/auth workflows)
        +--> Monitoring (Prometheus/Grafana)
```

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query, i18next |
| Backend | Node.js, Express, JWT, Mongoose |
| Data | MongoDB, Redis |
| Async | BullMQ workers |
| Infra | Node.js services, Redis queues, monitoring stack |
| Integrations | Appwrite, Cloudinary, external AI services |

## Repository Layout

```text
ecokids-india/
├── client/                    # Web app
├── server/                    # API and backend services
├── mobile/                    # Expo React Native app
├── appwrite-functions/        # Appwrite cloud functions
├── docs/                      # Product + engineering documentation
│   └── compliance/            # Security/compliance/governance docs
├── scripts/                   # Utility and maintenance scripts
└── monitoring/                # Prometheus/alerting configs
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB
- Redis

### Install

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Configure
Create `server/.env` with required values (sample minimum):

```bash
MONGODB_URI=mongodb://localhost:27017/ecokids
JWT_SECRET=replace-with-strong-secret
PORT=5001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

### Run

```bash
npm run dev
```

## Core Commands

```bash
npm run dev            # run server + client
npm run server:dev     # run backend dev mode
npm run client:dev     # run frontend dev mode
npm run build          # build frontend
npm run seed           # seed backend data
npm run check:queries  # validate query safety scripts
```

## Key Documentation

### Root essentials
- [PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md)
- [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)
- [SCHOOL_ONBOARDING.md](SCHOOL_ONBOARDING.md)
- [CHANGELOG.md](CHANGELOG.md)

### Technical docs
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- [docs/RUNBOOK.md](docs/RUNBOOK.md)

### Compliance docs
- [docs/compliance/COMPLIANCE_CHECKLIST.md](docs/compliance/COMPLIANCE_CHECKLIST.md)
- [docs/compliance/SECURITY_COMPLIANCE.md](docs/compliance/SECURITY_COMPLIANCE.md)
- [docs/compliance/DISASTER_RECOVERY_PLAN.md](docs/compliance/DISASTER_RECOVERY_PLAN.md)
- [docs/compliance/PARENTAL_CONSENT_SYSTEM_SPEC.md](docs/compliance/PARENTAL_CONSENT_SYSTEM_SPEC.md)

## License
MIT

---
Built for classrooms that want outcomes, not just slides.