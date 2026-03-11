<div align="center">

```
███████╗ ██████╗ ██████╗ ██╗  ██╗██╗██████╗ ███████╗
██╔════╝██╔════╝██╔═══██╗██║ ██╔╝██║██╔══██╗██╔════╝
█████╗  ██║     ██║   ██║█████╔╝ ██║██║  ██║███████╗
██╔══╝  ██║     ██║   ██║██╔═██╗ ██║██║  ██║╚════██║
███████╗╚██████╗╚██████╔╝██║  ██╗██║██████╔╝███████║
╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝
                    🌿 I N D I A 🌿
```

### *Learn. Play. Save the Planet.*

**India's first grade-adaptive, fully localised gamified environmental education platform — built for the classroom, scaled for a generation.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ecokids.in-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://github.com/itskum47/Ecokids-India)
[![MIT License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)

[![Languages](https://img.shields.io/badge/Languages-10%20Indian%20Languages-f97316?style=for-the-badge&logo=google-translate&logoColor=white)](#-multilingual-support)
[![DPDP](https://img.shields.io/badge/Compliance-DPDP%202023%20%7C%20RTE%20Act-8b5cf6?style=for-the-badge&logo=shield&logoColor=white)](#-compliance--security)
[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge&logo=github-actions&logoColor=white)](.github/workflows)

</div>

---

> **EcoKids India** transforms dry environmental education into an addictive, points-driven adventure. Students earn Eco-Points for planting trees, sorting waste, conserving water, and acing quizzes — all verified by teachers and tracked in real-time across school, district, and state leaderboards. Every feature adapts to the child's grade band, speaks their mother tongue, and works offline when the Wi-Fi disappears.

---

## ✨ Features

### 🎮 Gamification Engine
- **Eco-Points & XP** — Every quiz, experiment, and real-world activity earns XP with streak multipliers
- **Badges & Achievements** — Unlock "Tree Guardian", "Water Warrior", "Climate Hero" and 40+ badges
- **Leaderboards** — Live rankings at student → class → school → district → state level
- **Confetti Celebrations** — canvas-confetti powered reward moments on quiz pass

### 🕹️ Interactive Games
| Game | Topic | Mechanic |
|------|-------|----------|
| Waste Sort Rush | Waste Management | Drag-and-drop sorting |
| Water Journey | Water Conservation | Resource flow puzzle |
| Tree Planter | Biodiversity | Click-to-grow simulation |
| Climate Simulator | Climate Change | Cause-effect strategy |

### 🔬 Hands-on Experiments
- Step-by-step guided science experiments (Water Quality, Waste Segregation, Solar Energy, and more)
- **Photo proof submission** with camera or file upload
- **Teacher approval workflow** — verified submissions release Eco-Points instantly
- Immutable audit log entry created for every review action

### 📚 Grade-Adaptive Learning
The UI auto-detects the student's band and transforms the entire experience:

| Band | Grades | Style |
|------|--------|-------|
| 🌱 Seedling | 1–3 | Big fonts, cartoon illustrations, voice-friendly |
| 🔭 Explorer | 4–6 | Structured cards, progress rings |
| ⚡ Challenger | 7–9 | Dense data, streak counters, timed quizzes |
| 🎓 Expert | 10–12 | Assessment-grade UI, percentile scores |

### 🗣️ Multilingual Support
10 Indian languages — fully parity-checked (550 translation keys each):

`English` · `हिन्दी` · `বাংলা` · `தமிழ்` · `తెలుగు` · `मराठी` · `ಕನ್ನಡ` · `ગુજરાતી` · `ਪੰਜਾਬੀ` · `മലയാളം`

### 🏫 School Infrastructure
- **QR Code Login** — printable A4 QR cards for instant classroom login (no password needed)
- **Multi-tenant Isolation** — school data is cryptographically isolated; cross-school queries are blocked and audit-logged
- **Parental Consent System** — OTP-verified digital consent with DPDP Act 2023 compliant version history
- **Offline Activity Submission** — IndexedDB queue syncs automatically on reconnect
- **Principal Reports** — PDF/CSV management reports with 5-slide presentation mode

### 👩‍🏫 Teacher & Admin Tooling
- Submission review queue with approve/reject + rich feedback
- Class progress heatmaps and engagement analytics
- Bulk parental consent send/reminder/export
- Immutable audit logs — every sensitive action is recorded with actor, IP, user-agent, and compliance flags

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · Vite · Redux Toolkit · Tailwind CSS · React Router v6 |
| **i18n** | react-i18next · 10 locale JSON files · 550 keys each |
| **Backend** | Node.js 18 · Express · JWT · Multer · Cloudinary |
| **Database** | MongoDB · Mongoose · Compound indexes · TTL collections |
| **DevOps** | Docker · Kubernetes (Helm charts) · Nginx · GitHub Actions CI/CD |
| **Monitoring** | Prometheus · Alertmanager · Custom dashboards |
| **Security** | bcryptjs · Helmet · CORS · Rate limiting · Input sanitisation |
| **Compliance** | DPDP Act 2023 · RTE Act 2009 · CERT-In hardening |

</div>

---

## 🏗 Architecture

```
ecokids-india/
├── client/                     # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── layout/         # Navbar, Footer, EcoBot AI assistant
│   │   ├── pages/              # Route-level page components
│   │   ├── games/              # Four interactive eco-games
│   │   ├── hooks/              # useGradeBand, useOfflineQueue, useAuth ...
│   │   ├── store/              # Redux slices (auth, progress, gamification)
│   │   ├── i18n/locales/       # 10 × locale JSON files
│   │   └── utils/
│   └── vite.config.js          # Package-aware manual chunk splitting
│
├── server/                     # Node.js + Express REST API
│   ├── controllers/            # Auth, experiments, gamification, audit ...
│   ├── models/                 # Mongoose schemas (User, School, Submission ...)
│   ├── routes/                 # Versioned API routes (/api/v1/...)
│   ├── middleware/             # JWT guard, RBAC, school isolation, rate limit
│   ├── services/               # QR, PDF reports, consent, offline sync
│   └── server.js
│
├── k8s/helm/                   # Kubernetes Helm chart
├── monitoring/                 # Prometheus + Alertmanager config
├── nginx/                      # Reverse proxy config
├── docker-compose.yml          # Local dev stack
├── docker-compose.prod.yml     # Production stack
└── docs/                       # 40+ markdown docs
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local) or a free [MongoDB Atlas](https://mongodb.com/atlas) cluster
- **npm 9+**

### 1 — Clone

```bash
git clone https://github.com/itskum47/Ecokids-India.git
cd Ecokids-India
```

### 2 — Configure environment

```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/ecokids-india
JWT_SECRET=change-me-to-a-long-random-secret
PORT=5001
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3 — Install dependencies

```bash
# From repo root — installs both server + client
npm install
cd server && npm install
cd ../client && npm install
```

### 4 — Seed demo data *(optional but recommended)*

```bash
cd server && npm run seed
```

### 5 — Run

```bash
# Terminal A — Backend
cd server && npm start

# Terminal B — Frontend
cd client && npm run dev
```

Open **http://localhost:5173** 🎉

### 6 — Or use Docker

```bash
docker-compose up --build
```

---

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🎒 Student | `student@ecokids.test` | `password123` |
| 👩‍🏫 Teacher | `teacher@ecokids.test` | `password123` |
| 🏫 School Admin | `admin@ecokids.test` | `password123` |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login → JWT |
| `GET` | `/api/auth/me` | Current user |

### Experiments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/experiments` | List experiments |
| `POST` | `/api/experiments/:id/submit` | Submit with photo |
| `PATCH` | `/api/experiments/:id/review` | Teacher approve/reject |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gamification/leaderboard` | Ranked leaderboard |
| `GET` | `/api/gamification/profile` | Student stats |

### School Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/qr/generate` | Generate QR login cards |
| `GET` | `/api/consent/status` | Parental consent overview |
| `POST` | `/api/activity/sync-offline` | Batch offline sync |
| `GET` | `/api/reports/principal` | PDF management report |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit/logs` | Query audit log (admin only) |

---

## 📊 Data Flow

```
Student completes real-world activity
            │
            ▼
    Photo + observations uploaded
            │
            ▼
   MongoDB stores (status: pending)
   Audit log entry created (immutable)
            │
            ▼
   Teacher reviews in dashboard
            │
       ┌────┴────┐
    Approve    Reject
       │          │
       ▼          ▼
  Eco-Points    Feedback
  + Badge       sent to
  + XP          student
       │
       ▼
  Leaderboard updated (school → district → state)
  Confetti 🎉 on student screen
```

---

## 🔐 Compliance & Security

| Standard | Status | Detail |
|----------|--------|--------|
| **DPDP Act 2023** | ✅ Full | Consent versioning, reconsent workflow, policy history |
| **RTE Act 2009** | ✅ Full | Parental consent gate at registration |
| **CERT-In** | ✅ Hardened | CSP, HSTS, rate limiting, input sanitisation |
| **RBAC** | ✅ Full | 4 roles, route-level enforcement, school isolation |
| **Audit Logging** | ✅ Full | Immutable, TTL-indexed, queryable by 8 endpoints |
| **Data Isolation** | ✅ Full | Middleware blocks all cross-school data access |

---

## 🧪 Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend linting + type-check
cd client && npm run lint

# Production build smoke test
cd client && npm run build
```

Build target: all JS chunks < 400 KB ✅ (largest: `antd-form` @ 284 kB gzip)

---

## 🐛 Troubleshooting

<details>
<summary><strong>MongoDB connection refused</strong></summary>

Start MongoDB locally: `mongod` — or swap `MONGODB_URI` for a MongoDB Atlas URI.
</details>

<details>
<summary><strong>Port 5001 already in use</strong></summary>

```bash
lsof -ti:5001 | xargs kill -9
```
</details>

<details>
<summary><strong>Module not found / post-install errors</strong></summary>

```bash
rm -rf node_modules package-lock.json && npm install
```
</details>

<details>
<summary><strong>Translations not showing</strong></summary>

Locale files live at `client/src/i18n/locales/<lang>.json`. All 10 files are parity-checked at 550 keys each. If a key is missing, `i18next` falls back to `en.json`.
</details>

---

## 📚 Documentation

Comprehensive docs in the `/docs` folder:

| Doc | What it covers |
|-----|---------------|
| [PHASE_1_START_HERE.md](docs/PHASE_1_START_HERE.md) | Developer onboarding |
| [TEACHER_TRAINING_GUIDE.md](docs/TEACHER_TRAINING_GUIDE.md) | Classroom deployment playbook |
| [SCHOOL_ADMIN_PLAYBOOK.md](docs/SCHOOL_ADMIN_PLAYBOOK.md) | Month-by-month admin guide |
| [STUDENT_QUICK_START.md](docs/STUDENT_QUICK_START.md) | 5-minute student guide |
| [DISASTER_RECOVERY_PLAN.md](docs/DISASTER_RECOVERY_PLAN.md) | Backup and recovery |
| [GOVERNMENT_EVALUATION_REPORT.md](docs/GOVERNMENT_EVALUATION_REPORT.md) | Official technical audit |
| [AUDIT_LOGGING_DOCUMENTATION.md](docs/AUDIT_LOGGING_DOCUMENTATION.md) | Compliance logging spec |
| [PRODUCTION_RUNBOOK.md](PRODUCTION_RUNBOOK.md) | Ops runbook |

---

## 🤝 Contributing

Pull requests are warmly welcomed. Please:

1. Fork and create a feature branch: `git checkout -b feat/my-feature`
2. Follow existing patterns (components, hooks, i18n keys, audit logging)
3. Add translation keys to **all 10 locale files** if you add user-facing text
4. Run `npm run build` inside `/client` — ensure no chunk exceeds 400 KB
5. Open a PR with a clear description referencing an issue

---

## 🌟 Acknowledgements

Built to bring measurable environmental impact to every classroom in India, aligned with:

- 🇮🇳 **National Education Policy (NEP) 2020**
- 🌍 **UN Sustainable Development Goals** (SDG 4 + SDG 13)
- 🔒 **DPDP Act 2023** and **RTE Act 2009** child data protection standards

---

## 📄 License

MIT © 2024–2026 EcoKids India. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with 💚 for a sustainable future**

*One classroom at a time. One planet for all.*

[![GitHub Stars](https://img.shields.io/github/stars/itskum47/Ecokids-India?style=social)](https://github.com/itskum47/Ecokids-India)
[![GitHub Forks](https://img.shields.io/github/forks/itskum47/Ecokids-India?style=social)](https://github.com/itskum47/Ecokids-India/fork)

</div>
