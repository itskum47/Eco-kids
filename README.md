<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:16a34a,100:4ade80&height=200&section=header&text=%F0%9F%8C%BF%20EcoKids%20India&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Learn%20Better.%20Live%20Greener.%20Build%20Real%20Climate%20Habits.&descAlignY=60&descSize=18&descColor=dcfce7" alt="EcoKids India Banner" width="100%"/>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io)
[![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)

<br/>

> **A gamified, multilingual environmental education platform built to empower the next generation of climate leaders across Indian schools and colleges.**

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/itskum47/Eco-kids?style=social)](https://github.com/itskum47/Eco-kids/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/itskum47/Eco-kids?style=social)](https://github.com/itskum47/Eco-kids/network/members)

</div>

---

## The Big Picture

> *"Environmental education shouldn't stop at a poster on a classroom wall."*

EcoKids India shatters the passive-learning mold. Instead of sitting through slides, **students act** — planting trees, testing water, sorting waste — and **earn rewards** for it. Every action is photo-verified by teachers, every point is auditable, and every school competes on a live leaderboard.

It's a complete, unbroken loop:

```
Learn  ->  Act  ->  Submit Evidence  ->  Teacher Verifies  ->  Earn Rewards  ->  Repeat
```

No fluff. Just outcomes.

---

## Feature Highlights

<table>
<tr>
<td width="50%">

### Real-World Action Engine
- Photo/video evidence submission for real eco-tasks
- 8 experiment categories: Water Quality, Waste Recycling, Air Quality, Soil Analysis, Plant Biology, Renewable Energy, Weather & Climate, Biodiversity
- 6 interactive eco-games built in
- Climate streak tracking to build lasting habits

</td>
<td width="50%">

### Gamification That Actually Works
- Dynamic Eco-Points system with full audit trail
- 5-tier badge system (Bronze to Platinum)
- Real-time leaderboards at school, district & state level
- Level-up progression and streak rewards

</td>
</tr>
<tr>
<td width="50%">

### Built for Bharat
- Multilingual support across **10 Indian languages**
- Multi-tier governance: School -> District -> State
- Offline submission queues for low-connectivity areas
- DPDP Act 2023 compliant (all minors, age < 18)

</td>
<td width="50%">

### Trust & Safety First
- AI + teacher dual-verification with anomaly detection
- Rate-limited teacher approvals (anti-fraud)
- Immutable approval audit logs
- Parental consent enforcement on every sensitive route
- Leaderboard anonymization (SHA-256 hashed IDs)

</td>
</tr>
<tr>
<td width="50%">

### School & College Support
- Roles: Student, Teacher, School Admin, District Admin, State Admin, Faculty Advisor
- Campus Chapters for student-led initiatives (UG-exclusive)
- Research Track submissions with GPS + write-up for undergrads
- Green Career Pathways badge mapping

</td>
<td width="50%">

### Production-Grade Engineering
- BullMQ async queues for AI verification workflows
- Socket.io server-authoritative real-time leaderboards
- Prometheus + Grafana monitoring stack
- PWA-ready with service worker offline sync

</td>
</tr>
</table>

---

## Architecture

```
+----------------------------------------------------------+
|          Web App (React 18 + Vite)                       |
|          Mobile App (React Native / Expo)                |
+------------------------+--------------------------------+
                         |  REST + WebSocket
+------------------------v--------------------------------+
|              API Layer  (Node.js / Express)             |
|                                                         |
|  +----------+  +------------+  +--------------------+  |
|  | MongoDB  |  | Redis      |  | BullMQ Workers     |  |
|  | (Core DB)|  | (Cache +   |  | (AI Verification,  |  |
|  |          |  |  Sessions) |  |  Notifications)    |  |
|  +----------+  +------------+  +--------------------+  |
|                                                         |
|  +------------------+  +---------------------------+   |
|  | Appwrite         |  | Cloudinary (Media)        |   |
|  | (Auth/Functions) |  | AI Services (Verify)      |   |
|  +------------------+  +---------------------------+   |
|                                                         |
|  +-----------------------------------------------------+ |
|  |       Prometheus + Grafana (Monitoring)             | |
|  +-----------------------------------------------------+ |
+---------------------------------------------------------+
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query, i18next |
| **Mobile** | React Native, Expo |
| **Backend** | Node.js, Express, JWT, Mongoose, Socket.io |
| **Database** | MongoDB Atlas, Redis |
| **Async & Queues** | BullMQ workers |
| **Integrations** | Appwrite (Auth/Functions), Cloudinary (Media), AI Verification Services |
| **Monitoring** | Prometheus, Grafana |
| **Compliance** | DPDP Act 2023, RBAC, Parental Consent Framework |

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| MongoDB | Local or Atlas |
| Redis | Any (default port 6379) |

### 1. Clone & Install

```bash
git clone https://github.com/itskum47/Eco-kids.git
cd Eco-kids
npm run install:all
```

### 2. Configure Environment

Create `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ecokids
JWT_SECRET=replace-with-a-very-strong-secret
PORT=5001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
LEADERBOARD_ID_SALT=replace-with-a-random-salt
```

> See [`server/.env.example`](server/.env.example) for all available options.

### 3. Seed Demo Data

```bash
npm run seed
```

### 4. Launch

```bash
npm run dev
```

The React app starts on **`http://localhost:5173`** and the API on **`http://localhost:5001`**.

---

## Key Commands

| Command | What It Does |
|---|---|
| `npm run dev` | Runs backend + frontend concurrently |
| `npm run server:dev` | Backend API only (dev mode) |
| `npm run client:dev` | Frontend React app only |
| `npm run seed` | Seeds database with demo data |
| `npm run build` | Production build of the frontend |
| `npm run demo:smoke` | Runs smoke tests against the demo env |
| `npm run check:queries` | Audits for unbounded DB queries |

---

## Roles & Access

| Role | What They Do |
|---|---|
| **Student** | Learn, complete eco-tasks, earn points & badges |
| **Teacher** | Verify submissions, manage students |
| **School Admin** | Oversee school-wide performance & settings |
| **District Admin** | Cross-school analytics and governance |
| **State Admin** | Platform-wide oversight, suspicious approval detection |
| **Faculty Advisor** | Guides UG research track submissions |

---

## Eco-Actions Students Can Take

```
Water Quality Testing         Waste Segregation & Recycling
Air Quality Assessment        Soil Analysis
Plant Biology                 Renewable Energy Concepts
Weather & Climate             Biodiversity Tracking
```

Plus **6 interactive games** — Eco-Adventure Quest, Maze Navigation, Memory Match, Puzzle Solving, Waste Sorting, and Connect-the-Dots.

---

## Compliance & Safety

EcoKids India takes student safety seriously:

- **DPDP Act 2023** — Parental consent required for all users under 18
- **Leaderboard Anonymization** — Student IDs hashed (SHA-256), only first name + last initial shown publicly
- **Eco-Anxiety Sensitivity** — Distressing content gated with teacher facilitation notes
- **Immutable Audit Logs** — Every approval, rejection, and admin action is logged forever
- **Rate-Limited Approvals** — Automatic fraud detection for bulk-approval patterns
- **RBAC** — Strict domain boundaries; students can never touch teacher or admin routes

---

## Documentation

**Operations**

| Doc | Description |
|---|---|
| [Production Runbook](PRODUCTION_RUNBOOK.md) | Deployment & ops playbook |
| [Demo Credentials](DEMO_CREDENTIALS.md) | Test account logins |
| [School Onboarding](SCHOOL_ONBOARDING.md) | Getting a school onto the platform |

**Technical Specs**

| Doc | Description |
|---|---|
| [Architecture Overview](docs/ARCHITECTURE.md) | System design deep-dive |
| [API Specification](docs/API_SPECIFICATION.md) | Full REST API reference |
| [Database Schema](docs/DATABASE_SCHEMA.md) | MongoDB collections & models |

**Compliance**

| Doc | Description |
|---|---|
| [Security Compliance](docs/compliance/SECURITY_COMPLIANCE.md) | Security posture & controls |
| [Disaster Recovery Plan](docs/compliance/DISASTER_RECOVERY_PLAN.md) | Backup & recovery procedures |
| [Parental Consent Spec](docs/compliance/PARENTAL_CONSENT_SYSTEM_SPEC.md) | DPDP Act implementation details |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add some feature'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow conventional commits and keep PRs focused.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:16a34a,100:4ade80&height=120&section=footer" alt="footer" width="100%"/>

**EcoKids India** — *Built for classrooms that want outcomes, not just slides.*

Made with love for the next generation of climate leaders.

[MIT License](LICENSE)

</div>
