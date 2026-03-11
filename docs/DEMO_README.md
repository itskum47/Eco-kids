# EcoKids India - Government Demo Guide

## 🎯 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (running locally or on Atlas)
- npm/yarn package manager

### Installation

```bash
# Root directory
npm install

# Frontend setup
cd client && npm install && cd ..

# Backend setup
cd server && npm install && cd ..
```

### Running the Application

**Development Mode (Both Frontend + Backend):**
```bash
npm run dev
```

**Frontend Only:**
```bash
cd client && npm run dev
```

**Backend Only:**
```bash
cd server && npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

---

## 🔐 Demo Credentials

### Admin Account
```
Email: admin@ecokids.demo
Password: Demo@123456
Role: Admin (full system access)
```

### Student Accounts
```
Raj Kumar (Student 1)
Email: raj@ecokids.demo
Password: Student@123
Grade: 6 | School: Delhi Public School

Priya Singh (Student 2)
Email: priya@ecokids.demo
Password: Student@123
Grade: 7 | School: Delhi Public School

Aksh Verma (Student 3)
Email: aksh@ecokids.demo
Password: Student@123
Grade: 6 | School: Govt. School

Neha Sharma (Student 4)
Email: neha@ecokids.demo
Password: Student@123
Grade: 8 | School: Delhi Public School

Vikram Patel (Student 5)
Email: vikram@ecokids.demo
Password: Student@123
Grade: 7 | School: Govt. School
```

---

## 📚 Available Features

### A. Student Features

#### 1. User Authentication
- ✅ Email/Password Login
- ✅ Account Registration
- ✅ Profile Management
- ✅ Persistent JWT authentication

#### 2. Experiments (2 Available)

**Experiment 1: Water Quality Observation**
- Observe and test water samples
- Measure pH levels, clarity, color, odor
- Upload photos of water source and test results
- Submit observations and conclusions
- Earn 50 EcoPoints on approval

**Experiment 2: Waste Segregation Audit**
- Conduct waste audit at home/school/community
- Segregate waste into 6 categories (Organic, Paper, Plastic, Metal, Glass, Others)
- Count waste items
- Upload photos of segregated waste
- Share findings and action points
- Earn 75 EcoPoints on approval

#### 3. Submission Flow
1. Student selects an experiment
2. Fills out required form fields
3. Uploads photos (optional)
4. Submits for admin review
5. Status changes to "Pending"
6. Student can view submission status in profile

#### 4. Eco-Points System
- **Points Awarded:** Only when admin approves a submission
- **Default Values:** 
  - Water Quality: 50 points
  - Waste Segregation: 75 points
- **Visibility:** Real-time in user dashboard and leaderboard
- **Uses:** Leaderboard ranking, gamification

#### 5. Leaderboard
- Global ranking by total EcoPoints
- Real-time data from database
- Shows rank, student name, school, grade, total points
- User's position highlighted if logged in
- Top 3 shown with medal emojis (🥇🥈🥉)

### B. Admin Features

#### 1. Admin Dashboard (`/admin`)
- View all pending submissions
- Filter by status (Pending, Approved, Rejected)
- View student details (name, school, grade)
- Review observations and results
- View uploaded photos
- Leave feedback

#### 2. Submission Review
- **Approve:** Award points + complete submission
- **Reject:** Provide feedback, no points awarded
- **Batch Actions:** Pending - can approve/reject individually
- **Real-time:** Points update immediately on approval

#### 3. Admin Endpoints

```
GET /api/admin/overview
- Total users
- Total submissions (by status)
- Total eco-points awarded
- Average points per student

GET /api/admin/submissions?status=[pending|approved|rejected]
- List of submissions with full details
- Student information
- Observation/results text
- Photos uploaded
- Approval status & feedback

GET /api/admin/leaderboard
- Top 100 students by eco-points
- Rank, name, school, grade, points

GET /api/admin/users
- All registered users
- Filter by role
- User details and activity
```

---

## 📊 Demo Data Available

**Included in seed:**
- ✅ 5 student accounts
- ✅ 1 admin account
- ✅ 2 experiments (Water Quality, Waste Segregation)
- ✅ 7 sample submissions:
  - 4 Approved (with points awarded)
  - 2 Pending (awaiting admin review)
  - 1 Rejected (with feedback)

**Eco-Points Distribution:**
- Raj Kumar: 125 points (2 approved)
- Priya Singh: 0 points (1 pending, 1 approved)
- Aksh Verma: 125 points (2 approved)
- Neha Sharma: 0 points (1 rejected)
- Vikram Patel: 0 points (no submissions)

---

## 🔄 Data Flow (Government Audit Trail)

### Submission Flow
```
Student Submits Experiment
    ↓
Form Data + Photos stored in MongoDB
    ↓
Submission status = "pending"
Timestamp recorded (submittedAt)
    ↓
Admin Views in /admin/submissions
    ↓
Admin Approves/Rejects
    ↓
IF APPROVED:
  - Status = "approved"
  - Points awarded to student (immediate)
  - reviewedAt timestamp recorded
  - Student points visible in leaderboard
  
IF REJECTED:
  - Status = "rejected"
  - Feedback provided
  - reviewedAt timestamp recorded
  - No points awarded
```

### Audit Trail
All actions are stored in MongoDB with timestamps:
- User registration (email, password hash, role)
- Submission creation (user, content, photos)
- Admin approval/rejection (status, feedback, admin id, timestamp)
- Points awarded (user points updated atomically)

**Queries for government evaluation:**
- List all submissions ever made (with status)
- Show points awarded per user (by approval date)
- Generate reports of student activity
- Verify data integrity (no duplicate points)

---

## 🚀 Demo Walkthrough (5 minutes)

### 1. Login as Admin (1 min)
```
1. Visit http://localhost:5173
2. Click "Admin Login"
3. Enter: admin@ecokids.demo / Demo@123456
4. See Admin Dashboard
```

### 2. Review Submissions (2 min)
```
1. Navigate to /admin/submissions
2. See 2 pending submissions from students
3. Click "Approve" on one submission
   - Watch points awarded in real-time
4. Click "Reject" on another
   - Provide feedback
```

### 3. View Leaderboard (1 min)
```
1. Logout (top-right menu)
2. Navigate to /leaderboard
3. See real-time rankings
4. Approved submissions reflect in points
```

### 4. Student Experience (1 min)
```
1. Login as Raj Kumar: raj@ecokids.demo / Student@123
2. Navigate to Experiments
3. Select "Water Quality Observation"
4. Click "Submit Results"
5. Fill form fields (observations, results, etc.)
6. Submit (would show "Awaiting Admin Approval")
7. Check leaderboard to see your rank
```

---

## 🛠️ Technical Stack

### Frontend
- **Framework:** React 18 + Vite
- **State Management:** Redux
- **Styling:** Tailwind CSS
- **API Client:** Axios
- **Icons:** React Icons
- **Internationalization:** i18n-js (8 languages)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Local or Atlas)
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Validation:** express-validator
- **Password Hashing:** bcryptjs

### Database Models
```
User
├── name, email, password (hashed)
├── role: 'student' | 'teacher' | 'admin'
├── profile: {school, grade, city, state}
└── gamification: {ecoPoints, level, badges}

Experiment
├── title, description, objective
├── category: 'water-testing' | 'waste-recycling' | ...
├── ecoPointsReward: 50 | 75 | ...
├── formFields: [{name, label, type, required}]
└── submissions: [{
    user,
    observations,
    results,
    photos,
    status,
    points,
    submittedAt,
    reviewedAt
  }]

Progress
├── userId, experimentId
├── status: 'not_started' | 'in_progress' | 'completed'
├── score, timeSpent, attempts
└── data: {quizAnswers, gameProgress, experimentProgress}
```

---

## 📝 API Endpoints Summary

### Public Routes (No Auth Required)
```
GET  /api/experiments                    - List all experiments
GET  /api/experiments/:slug              - Get single experiment
GET  /api/gamification/leaderboards      - Get leaderboard
GET  /api/gamification/badges            - Get available badges
GET  /api/gamification/levels            - Get level info
```

### Authentication Routes (Public)
```
POST /api/auth/register                  - Create account
POST /api/auth/login                     - Login
GET  /api/auth/me                        - Get current user (requires token)
PUT  /api/auth/profile                   - Update profile (requires token)
```

### Student Routes (Auth Required)
```
POST /api/experiments/:id/submit          - Submit experiment result
GET  /api/experiments/my-submissions      - Get own submissions
GET  /api/progress                        - Get learning progress
```

### Admin Routes (Auth Required + Admin Role)
```
GET  /api/admin/overview                 - Dashboard overview
GET  /api/admin/submissions              - List all submissions
GET  /api/admin/submissions?status=...   - Filter submissions
GET  /api/admin/leaderboard              - Get leaderboard
PUT  /api/experiments/:id/submissions/:id - Review submission
GET  /api/admin/users                    - List all users
GET  /api/admin/dashboard                - Dashboard stats
```

---

## 🔐 Security Implementation

### Authentication
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected routes require valid token
- ✅ Admin-only endpoints verified server-side

### Input Validation
- ✅ Email format validation
- ✅ Password minimum length (6 chars)
- ✅ Form field type checking
- ✅ File upload size limits (10MB max)
- ✅ SQL injection prevention (MongoDB)

### File Upload
- ✅ File type validation
- ✅ Size limits enforced
- ✅ Cloudinary integration (secure CDN)
- ✅ Local `/uploads` folder fallback

### CORS
- ✅ Configured for localhost:5173 (dev)
- ✅ Production domains to be set in .env
- ✅ Credentials allowed

---

## 🐛 Known Limitations & Future Work (Phase 2)

### Current Limitations
❌ No email notifications (planned)
❌ No SMS for low-connectivity areas (planned)
❌ No AI fraud detection for submissions (planned)
❌ Teacher mobile app not built (planned)
❌ Offline mode not implemented (PWA planned)
❌ No government API integration yet (planned)
❌ Single region only (multi-region in Phase 2)

### Phase 2 Roadmap
- [ ] Teacher mobile app for field approvals
- [ ] AI image recognition for fraud detection
- [ ] SMS gateway for notifications
- [ ] Progressive Web App (offline support)
- [ ] Government API integration (UDISE+, DIKSHA)
- [ ] Multi-language SMS
- [ ] 3-tier verification (Student → Teacher → District Officer)
- [ ] Parental consent workflow
- [ ] Government reporting dashboard
- [ ] Certifications (ISO 27001, SOC 2)

---

## 📞 Troubleshooting

### MongoDB Connection Refused
```
Issue: "connect ECONNREFUSED 127.0.0.1:27017"
Solution:
1. Start MongoDB: brew services start mongodb-community
2. Check running: brew services list
3. Or use MongoDB Atlas cloud (update MONGODB_URI in .env)
```

### Port Already in Use
```
Issue: "EADDRINUSE: address already in use :::5001"
Solution:
1. Kill existing process: pkill -f "node server.js"
2. Or change PORT in .env (e.g., PORT=5002)
3. Update frontend API calls accordingly
```

### CORS Errors
```
Issue: "Access to XMLHttpRequest blocked by CORS policy"
Solution:
1. Check CORS config in /server/server.js
2. Ensure frontend URL is in allowed origins
3. For localhost:5173, should already be configured
```

### JWT Token Expired
```
Issue: "Token expired" or 401 Unauthorized
Solution:
1. Login again to get new token
2. Check JWT_EXPIRE in .env (default 7d)
3. Clear browser localStorage if issues persist
```

---

## 📊 Government Evaluation Checklist

- ✅ **Functional Requirements:**
  - User authentication with JWT
  - Experiment submission with photos
  - Admin approval workflow
  - Points tracking and leaderboard
  - Real database persistence

- ✅ **Auditability:**
  - All submissions timestamped
  - Approval trail recorded
  - Points awarded atomically
  - Admin actions tracked

- ✅ **Security:**
  - Password hashing
  - JWT auth
  - Input validation
  - Protected admin routes

- ✅ **Demo Data:**
  - 5 students with varied data
  - Multiple submission states
  - Points distribution example
  - Real leaderboard ranking

- ⏳ **Phase 2 (Before Pilot):**
  - Parental consent mechanism
  - Teacher training curriculum
  - Offline sync capability
  - SMS fallback system
  - Load testing report
  - Security certifications

---

## 🎓 For Government Officials

### What This Demo Shows
1. **System Functionality:** Students can submit real experiments with photos; admins can review and approve
2. **Data Persistence:** All data stored in MongoDB (verifiable)
3. **Transparency:** Full audit trail of submissions and approvals
4. **Scalability:** Can handle multiple schools, districts, regions
5. **Language Support:** 8 Indian languages built-in (i18n)

### What This Demo Does NOT Show (Phase 2)
1. Large-scale deployment (production infrastructure)
2. Mobile offline sync
3. Government API integration
4. SMS notifications for low-connectivity areas
5. Advanced fraud detection
6. Teacher approval workflow
7. Parental consent mechanism

### Questions for Pilot Design
1. How many schools/students in pilot cohort?
2. Internet connectivity in target schools?
3. Teacher capacity for daily submissions review?
4. Preferred notification method (SMS/Email/Push)?
5. Government reporting requirements?

---

## 📄 License

Government of India - EcoKids Initiative  
For official use and pilot evaluation

---

**Generated:** February 4, 2026  
**Version:** 1.0 Demo  
**Status:** Ready for Government Evaluation
