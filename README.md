<div align="center">

# 🌿 EcoKids India V2
### Learn Better. Live Greener. Build Real Climate Habits. 🌍

A gamified, multilingual environmental education platform built to empower the next generation of climate leaders in Indian schools and colleges. 

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)

---

> 🚀 **Status:** Pre-launch Pilot Phase. The core platform is production-ready, featuring robust failsafes, extreme trust/audit integrity, and real-time multiplayer gamification. 

</div>

---

## 💡 Why EcoKids?

EcoKids India disrupts the standard "passive learning" model of environmental education by shifting the focus to **measurable, real-world action**. 

♻️ **Students** build habits through verified tasks (with media evidence).  
🧑‍🏫 **Teachers** audit and verify impact.  
🏫 **Schools** track real-world results: CO2 saved, waste reduced, trees planted, and water conserved.  

It’s an unbroken loop of **Learning -> Action -> Verification -> Reward -> Competition**.

## ✨ What Makes It Stand Out?

### 🎯 1. Real-World Action Workflow
- **Activity Submissions:** Complete real tasks and upload photo/video evidence.
- **Teacher Verification & Appeals:** Secure portal for teachers to approve/reject tasks with high trust boundaries.
- **Dynamic Gamification:** Gain points, badges, levels, and maintain "climate streaks."

### 🇮🇳 2. India-First Experience
- **Multilingual Support:** Accessible in 10 major Indian languages. 
- **School Governance:** Built with multi-tiered governance (School -> District -> State).
- **Resilient Connectivity:** Offline submission queues and fallbacks for areas with low/unstable connectivity.

### 🛡️ 3. Trust, Governance & Safety
- **Anti-Fraud Mechanics:** Verification confidence intervals, duplicate detection, and robust trust/fraud backends.
- **Role-Based Access Controls (RBAC):** Strict boundaries between Student, Teacher, and Admin domains.
- **Parental Consent & Safety:** Consent-aware routes safeguarding student identities.

### ⚡ 4. Scalable Engineering Base
- **Multi-Platform:** Web (React) and Mobile (React Native / Expo).
- **Asynchronous Queues:** Redis & BullMQ for heavy computational workflows.
- **Server-Authoritative Realtime:** Socket-driven leaderboards with deterministic fallback mechanisms.

---

## 🏗️ Architecture Snapshot

```text
Web App (React/Vite) & Mobile App (Expo)
       |
       v
API Layer (Node.js/Express)
       |--> MongoDB (Core Data)
       |--> Redis + BullMQ (Cache & Queues)
       |--> Appwrite Integrations (Auth/Functions)
       |--> Cloudinary & AI Services
       |--> Prometheus / Grafana Monitoring
```

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **🎨 Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query, i18next |
| **🚀 Backend** | Node.js, Express, JWT, Mongoose |
| **🗄️ Database** | MongoDB, Redis |
| **⚙️ Async & Queues**| BullMQ workers |
| **🔌 Integrations** | Appwrite (Auth/Functions), Cloudinary (Media), External AI Services |

---

## 🚀 Quick Start

### Prerequisites
Make sure your environment meets the following requirements:
- Node.js 18+ & npm 9+
- MongoDB instance running locally or via Atlas
- Redis instance running on default port

### Installation

Clone the repo, then install everything with a single command:
```bash
npm install
npm run install:all
```

### Configuration
Create a `.env` in the `server/` directory:
```bash
MONGODB_URI=mongodb://localhost:27017/ecokids
JWT_SECRET=replace-with-a-very-strong-secret
PORT=5001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

### Fire it up 🔥
Run the backend and frontend concurrently:
```bash
npm run dev
```

---

## 📚 Key Commands

| Command | Action |
|---|---|
| `npm run dev` | Spins up the server and client concurrently |
| `npm run server:dev` | Runs the backend API in dev mode |
| `npm run client:dev` | Runs the frontend React app in dev mode |
| `npm run seed` | Seeds backend with essential demo data |
| `npm run build` | Builds the frontend for production |

---

## 📖 Documentation Directory

**🛠️ Operational Guides**
- [Production Runbook](PRODUCTION_RUNBOOK.md)
- [Demo Credentials](DEMO_CREDENTIALS.md)
- [School Onboarding](SCHOOL_ONBOARDING.md)

**🏗️ Technical Specs**
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Specification](docs/API_SPECIFICATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)

**🔒 Compliance & Security**
- [Security Compliance](docs/compliance/SECURITY_COMPLIANCE.md)
- [Disaster Recovery Plan](docs/compliance/DISASTER_RECOVERY_PLAN.md)
- [Parental Consent Spec](docs/compliance/PARENTAL_CONSENT_SYSTEM_SPEC.md)

---

<div align="center">
<b>EcoKids India</b><br>
<i>Built for classrooms that want outcomes, not just slides.</i><br><br>

[MIT License](LICENSE)
</div>
