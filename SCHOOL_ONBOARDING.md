# 🏫 School Onboarding Guide

## Overview

This guide helps schools set up EcoKids in 3 phases:
1. **Pre-Setup:** Gather required information
2. **Setup Wizard:** Configure school via web interface
3. **Post-Setup:** Train teachers and onboard students

**Time Required:** 45-60 minutes (excluding bulk student import)

---

## Phase 1: Prerequisites

### Information to Gather

#### School Details
- [ ] **School Name** (as registered with UDISE)
- [ ] **UDISE Code** (11-digit unique identifier from government)
- [ ] **Board Affiliation** (CBSE / ICSE / State Board)
- [ ] **Principal Name** and **Email**
- [ ] **School Address** (for certificates and reports)
- [ ] **Contact Phone** (for SMS notifications)
- [ ] **School Logo** (PNG/JPG, 512x512px, optional)

#### Academic Year Setup
- [ ] **Current Academic Year** (e.g., 2025-2026)
- [ ] **Start Date** (e.g., April 1, 2025)
- [ ] **End Date** (e.g., March 31, 2026)
- [ ] **Grading System** (1-10 or 1-12)

#### Teacher Roster
- [ ] List of teachers with email addresses
- [ ] Subjects taught
- [ ] Classes assigned (e.g., Teacher A handles Grade 5-A and 5-B)

**Template:** Download [teacher-import-template.csv](./templates/teacher-import.csv)

#### Student Roster
- [ ] Student names (First + Last)
- [ ] Grade and Section
- [ ] Roll numbers
- [ ] Parent email addresses
- [ ] Parent phone numbers (for SMS OTP)

**Template:** Download [student-import-template.csv](./templates/student-import.csv)

---

## Phase 2: Setup Wizard (Web Interface)

### Step 1: School Admin Account Creation

1. **Navigate to:** https://app.ecokids.in/register
2. **Select Role:** "School Administrator"
3. **Fill Form:**
   - Full Name (Principal or IT Coordinator)
   - Email (official school email)
   - Password (minimum 8 characters, 1 uppercase, 1 number)
   - Mobile Number (for OTP verification)
4. **Verify Email:** Check inbox for verification link
5. **First Login:** Use credentials to access admin dashboard

---

### Step 2: School Details

After first login, you will be directed to the **Setup Wizard**.

**Page 1 of 5: School Details**

- **School Name:** Delhi Public School, Sector 12, RK Puram
- **UDISE Code:** 12345678901
- **Board:** CBSE
- **Principal Name:** Dr. Rajesh Kumar
- **Grades Offered:** Select 1-12 (or applicable range)
- **School Logo:** Upload PNG/JPG (optional)

**Click:** "Next: Academic Year"

---

### Step 3: Academic Year Configuration

**Page 2 of 5: Academic Year**

- **Academic Year:** 2025-2026
- **Start Date:** April 1, 2025
- **End Date:** March 31, 2026
- **Vacation Periods:** Add summer break (May 15 - June 20)
- **Public Holidays:** Add 10-15 national/school holidays

**Why?** This ensures activity deadlines respect school schedules.

**Click:** "Next: Import Teachers"

---

### Step 4: Bulk Teacher Import

**Page 3 of 5: Import Teachers**

#### Option A: Bulk CSV Upload

1. **Download Template:** [teacher-import-template.csv](./templates/teacher-import.csv)
2. **Fill Template:**
   ```csv
   name,email,subject,grade,class
   Ms. Priya Sharma,priya@dps-delhi.in,English,5,A
   Mr. Amit Verma,amit@dps-delhi.in,Science,6,B
   ```
3. **Upload File:** Drag-and-drop CSV or click "Browse"
4. **Review Preview:** Check for errors (invalid emails flagged in red)
5. **Confirm Import:** Click "Import 25 Teachers"

**Expected Output:**
- ✅ 23 teachers created successfully
- ⚠️ 2 teachers failed (duplicate emails)

#### Option B: Manual Entry

- Click "Add Teacher Manually"
- Fill form for each teacher
- Click "Add Another" to repeat

**Temp Passwords:** All teachers get password `EcoKids@{LastName}` (e.g., `EcoKids@Sharma`)

**Important:** Teachers must change password on first login.

**Click:** "Next: Import Students"

---

### Step 5: Bulk Student Import

**Page 4 of 5: Import Students**

#### CSV Format Requirements

```csv
name,email,grade,class,rollNumber,parentEmail,parentPhone
Arjun Sharma,arjun@student.dps-delhi.in,5,A,1001,parent1@example.com,+919876543210
Priya Patel,priya@student.dps-delhi.in,5,A,1002,parent2@example.com,+919876543211
```

**Required Columns:**
- `name` (First Last format)
- `email` (unique, school domain preferred)
- `grade` (numeric 1-12)
- `class` (A/B/C/D)
- `rollNumber` (unique per school)
- `parentEmail` (for consent emails)
- `parentPhone` (for SMS OTP login, E.164 format: +91XXXXXXXXXX)

#### Import Process

1. **Upload CSV:** Drag-and-drop file (max 1,000 rows per batch)
2. **Validation:** System checks for:
   - Duplicate emails
   - Invalid phone numbers
   - Missing required fields
3. **Preview:** First 10 rows shown for verification
4. **Execute Import:** Click "Import 500 Students"

**Expected Output:**
- ✅ 487 students created
- ⚠️ 13 students failed (see error report below)

**Error Report Example:**
| Row | Name | Error |
|-----|------|-------|
| 23  | Kabir Singh | Duplicate email: kabir@student.dps-delhi.in |
| 45  | Neha Gupta | Invalid phone format: 9876543210 (missing +91) |

**Temp Passwords:** All students get password `EcoKids@{rollNumber}` (e.g., `EcoKids@1001`)

**Click:** "Next: Launch"

---

### Step 6: Final Review & Launch

**Page 5 of 5: Launch**

**Summary:**
- ✅ School Details Configured
- ✅ Academic Year: 2025-2026
- ✅ 23 Teachers Imported
- ✅ 487 Students Imported

**Pending Actions:**
- [ ] Send welcome emails to teachers
- [ ] Send parent consent requests
- [ ] Activate student accounts after consent

**Click:** "Complete Setup & Go to Dashboard"

---

## Phase 3: Post-Setup Training

### Teacher Training (30 minutes)

#### 1. First Login & Password Change

- **Email:** Check inbox for "Welcome to EcoKids" email
- **Login:** https://app.ecokids.in/login
- **Temp Password:** `EcoKids@{YourLastName}`
- **Forced Password Change:** Follow prompt to set new password
- **Dashboard Access:** Redirected to teacher dashboard

#### 2. Activity Approval Workflow

**Navigate to:** Dashboard → "Pending Activities"

- **View Submission:** Click on any activity card
- **Check Photo:** Verify photo evidence matches activity description
- **Approve/Reject:**
  - **Approve:** Click ✅ and add feedback (e.g., "Great work! Keep it up.")
  - **Reject:** Click ❌ and explain why (e.g., "Photo unclear, please resubmit.")
- **Bulk Approve:** Select multiple verified activities → Click "Approve All"

**Best Practices:**
- Review within 24 hours to keep students engaged
- Leave constructive feedback on rejected activities
- Flag suspicious patterns (e.g., same photo reused)

#### 3. Creating School Challenges

**Navigate to:** Dashboard → "Challenges" → "Create New"

**Example Challenge:**
- **Title:** "Green Campus Week"
- **Description:** "Submit 50 tree planting or waste segregation activities as a school."
- **Target:** 50 activities
- **Deadline:** 7 days from now
- **Reward:** 500 EcoCoins per participant + Certificate

**Click:** "Launch Challenge"

#### 4. Viewing Class Leaderboards

**Navigate to:** Dashboard → "Leaderboards" → Filter by "My Classes"

- See top 10 students by EcoCoins
- Identify inactive students (0 activities)
- Download CSV report for offline analysis

---

### Student Onboarding (15 minutes in class)

#### Teacher-Led Session (Recommended)

**Day 1: Introduction (10 minutes)**

1. **Demo Login:**
   - Show students how to log in with email/password
   - Explain SMS OTP option (for students without email access)
2. **Dashboard Tour:**
   - Points, badges, leaderboard
   - Daily challenges
3. **First Activity:**
   - Assign simple task: "Take a photo of a plant in your home and submit."
   - Walk through submission process:
     - Go to Activities → "Submit New Activity"
     - Select activity type: "Tree Planting"
     - Upload photo
     - Add caption (50-200 characters)
     - Submit

**Day 2: Follow-Up (5 minutes)**

- Show approved activities with teacher feedback
- Highlight top 3 students in class leaderboard
- Explain badge system (e.g., "Eco Warrior" for 10 activities)

---

### Parent Consent Process

**Triggers:** After student accounts are created, automated emails sent to parent emails.

#### Email Content (Auto-Sent)

> **Subject:** Parent Consent Required for EcoKids Platform  
> 
> Dear Parent/Guardian,
> 
> Your child has been enrolled in EcoKids, a gamified environmental education platform at [School Name]. To activate their account, we need your consent to:
> - Store their activity submissions (photos, captions)
> - Display their first name + last initial on public leaderboards (e.g., "Arjun S.")
> - Send weekly progress reports to your email
> 
> **Review Terms:** [View Privacy Policy]  
> **Give Consent:** Click the link below to approve:  
> https://app.ecokids.in/consent?token=XXXXX
> 
> If you do not wish to participate, your child's account will remain inactive.
> 
> Thank you,  
> EcoKids Team

#### Consent Workflow

1. Parent clicks link in email
2. Redirected to consent form with:
   - Student name
   - School name
   - Data usage summary
   - Checkbox: "I consent to the terms above"
   - Digital signature field (type full name)
3. Submit consent
4. Student account activated (receives login credentials via email)

**If Parent Declines:**
- Student account remains in "Pending Consent" status
- Cannot login or participate in activities
- School admin can manually activate (for offline consent collected via paper forms)

---

## Phase 4: Monitoring & Maintenance

### Weekly Admin Tasks (5 minutes)

- [ ] Check "Inactive Students" report → Follow up with homeroom teachers
- [ ] Review "Pending Activities" count → Remind teachers to approve
- [ ] Check system health: Dashboard → "System Status" (MongoDB, Redis, Queue)
- [ ] Download weekly analytics CSV for school records

### Monthly Admin Tasks (15 minutes)

- [ ] Generate "Impact Report" (total activities, top students, school ranking)
- [ ] Share report with principal and governing body
- [ ] Review teacher engagement (average approval time)
- [ ] Update school challenges for next month

---

## Troubleshooting Common Issues

### Issue 1: "Teacher cannot approve activities"

**Cause:** Teacher account not assigned to correct class.

**Fix:**
1. Go to Dashboard → "Teachers" → Edit teacher
2. Check "Assigned Classes" dropdown
3. Add missing class (e.g., Grade 5-A)
4. Save changes

---

### Issue 2: "Students not receiving welcome emails"

**Cause:** Parent email bouncing or marked as spam.

**Fix:**
1. Go to Dashboard → "Students" → Search for student
2. Verify parent email is correct
3. Click "Resend Welcome Email"
4. Ask parent to check spam folder
5. Whitelist sender: `noreply@ecokids.in`

---

### Issue 3: "Bulk import CSV failed with 'Invalid phone format'"

**Cause:** Phone numbers not in E.164 format (+91XXXXXXXXXX).

**Fix:**
1. Open CSV in Excel/Google Sheets
2. Add formula to fix column:
   ```
   =IF(LEFT(B2,1)="+", B2, CONCATENATE("+91", B2))
   ```
3. Apply to all rows
4. Save and re-upload

---

### Issue 4: "School ranking not updating"

**Cause:** Leaderboard cache takes 5 minutes to refresh.

**Fix:**
- Wait 5 minutes and refresh page
- If still stuck, contact support: support@ecokids.in

---

## Support Contacts

### Tier 1: Self-Service
- **Help Center:** https://help.ecokids.in
- **Video Tutorials:** https://youtube.com/@ecokidsindia
- **FAQs:** https://ecokids.in/faq

### Tier 2: Email Support
- **General Queries:** support@ecokids.in (Response: 24 hours)
- **Technical Issues:** tech@ecokids.in (Response: 4 hours)
- **School Partnerships:** schools@ecokids.in

### Tier 3: Phone Support (Emergency)
- **Hotline:** +91-11-1234-5678 (Mon-Fri, 9 AM - 6 PM IST)
- **WhatsApp:** +91-98765-43210 (24/7 for critical issues)

---

## Appendix: CSV Templates

### Teacher Import Template

```csv
name,email,subject,grade,class
Ms. Priya Sharma,priya@school.in,English,5,A
Mr. Amit Verma,amit@school.in,Science,6,B
```

**Download:** [teacher-import-template.csv](/templates/teacher-import.csv)

---

### Student Import Template

```csv
name,email,grade,class,rollNumber,parentEmail,parentPhone
Arjun Sharma,arjun@student.school.in,5,A,1001,parent1@example.com,+919876543210
Priya Patel,priya@student.school.in,5,A,1002,parent2@example.com,+919876543211
```

**Download:** [student-import-template.csv](/templates/student-import.csv)

---

**End of Guide**

For additional assistance, schedule a 15-minute onboarding call: **[Book Here](https://calendly.com/ecokids/onboarding)**
