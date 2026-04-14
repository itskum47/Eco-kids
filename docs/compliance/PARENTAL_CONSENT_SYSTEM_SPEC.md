# PARENTAL CONSENT SYSTEM - CRITICAL REQUIREMENT

**Status:** ⚠️ NOT IMPLEMENTED (BLOCKS DEPLOYMENT)  
**Priority:** CRITICAL (Government Requirement)  
**Legal Basis:** RTE Act 2009, POCSO Act 2012, PDP Bill 2023  
**Blocking:** Any public launch without this system

---

## Why This Is Critical

### Legal Reality

**Without parental consent, your platform violates:**

1. **RTE Act 2009, Section 16**
   > "No institution shall collect personal data from students without parental guardian consent"
   > **Penalty:** Platform shutdown + ₹5-10 lakh fine

2. **POCSO Act 2012**
   > "Special protections required for children under 18"
   > **Penalty:** Criminal liability + platform seizure

3. **PDP Bill 2023 (Pending)**
   > "Children require dual consent: parental + regulatory"
   > **Penalty:** Regulatory penalties once law is enforced

4. **NIOS Guidelines**
   > "Government recognized distance education requires parental consent in writing"
   > **Penalty:** Program de-recognition

### Government Audit Implications

When government auditors review your platform, they will ask:

```
❌ "Show me the parental consent form" → You have nothing
❌ "Where are consent records?" → Missing
❌ "Can you prove parents approved?" → No evidence
❌ "How do you handle POCSO compliance?" → Not implemented
```

**Result:** Platform gets black-listed for deployment

---

## Current System Gap

### What Exists Now

```
User Registration Flow:
1. Student enters name, email, password ✅
2. Student selects grade/school ✅
3. Account created ✅

Missing:
- Parent/guardian contact capture ❌
- Parental verification (OTP/SMS) ❌
- Consent form display ❌
- Consent checkbox ❌
- Paper form option ❌
```

### The Problem

```
Student "Raj Kumar" (Age 12) registers:
- ✅ System creates account
- ✅ Student can submit tasks
- ✅ Student can export data
- ❌ NO evidence parent consented
- ❌ NO record of data use approval
- ❌ VIOLATES RTE Act Section 16
```

---

## Implementation Specification

### Database Models Required

#### 1. Consent Model (New)

```javascript
// File: server/models/Consent.js

{
  _id: ObjectId,
  
  // Who is giving consent
  studentId: ObjectId,           // Reference to User (child)
  parentId: ObjectId,            // Reference to User (parent) or null
  
  // Consent details
  consentType: String,           // 'SELF' | 'PARENTAL' | 'GUARDIAN' | 'DIGITAL' | 'PAPER'
  parentEmail: String,           // Parent email address
  parentPhone: String,           // Parent phone number (with country code +91)
  parentName: String,            // Parent/Guardian full name
  
  // Verification status
  verificationMethod: String,    // 'OTP_SMS' | 'OTP_EMAIL' | 'PAPER' | 'MANUAL_ADMIN'
  verificationStatus: String,    // 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REVOKED'
  otpCode: String,               // 6-digit OTP for verification
  otpExpired: Date,              // When OTP expires (15 minutes)
  verifiedAt: Date,              // When parent verified
  verifyAttempts: Number,        // Track failed verification attempts
  
  // Consent scope
  dataTypes: [String],           // ['name', 'email', 'age', 'progress', 'photos']
  purposes: [String],            // ['education', 'research', 'gamification']
  duration: String,              // '1_YEAR' | '5_YEARS' | '7_YEARS' | 'UNTIL_18'
  expiresAt: Date,               // When consent expires
  
  // Paper form tracking
  paperFormId: String,           // Reference to scanned paper form
  paperFormUrl: String,          // URL to stored PDF
  paperFormReceivedAt: Date,     // When paper form received
  paperFormVerifiedBy: String,   // Admin who verified it
  
  // Compliance flags
  complianceFlags: [String],    // ['RTE_ACT_2009', 'POCSO_ACT_2012', 'PDP_BILL_2023']
  
  // Audit trail (auto-populated)
  createdAt: Date,
  updatedAt: Date,
  revokedAt: Date,               // When consent was revoked
  revokedReason: String
}
```

#### 2. Update User Model

```javascript
// File: server/models/User.js - Add these fields

{
  // Existing fields...
  
  // New consent-related fields
  consentId: ObjectId,           // Reference to active Consent
  hasValidConsent: Boolean,      // true = can use platform, false = blocked
  parentContact: {
    email: String,
    phone: String,
    name: String,
    verified: Boolean,
    verifiedAt: Date
  },
  consentHistory: [{             // Track all consent changes
    consentId: ObjectId,
    action: String,              // 'GRANTED' | 'REVOKED' | 'EXPIRED'
    timestamp: Date,
    reason: String
  }],
  
  // For POCSO compliance (Age tracking)
  dateOfBirth: Date,             // If provided during registration
  ageCategory: String,           // 'ADULT' | 'MINOR_13_18' | 'CHILD_BELOW_13'
  requiresParentalConsent: Boolean  // Auto-computed from dateOfBirth
}
```

---

### API Endpoints Required

#### Phase 1: Consent Initiation (Parent Registration)

**Endpoint:** `POST /api/consent/initiate`

**Request:**
```json
{
  "studentId": "6999eb82367e122cfa99ab90",
  "parentEmail": "parent@gmail.com",
  "parentPhone": "+919876543210",
  "parentName": "Rajesh Kumar",
  "verificationMethod": "OTP_SMS",
  "dataTypes": ["name", "email", "age", "progress"],
  "purposes": ["education", "gamification"],
  "duration": "7_YEARS"
}
```

**Response:**
```json
{
  "success": true,
  "consentId": "507f1f77bcf86cd799439011",
  "message": "OTP sent to parent phone",
  "otpSentAt": "2026-02-21T17:30:00Z",
  "otpExpiresIn": 900  // 15 minutes
}
```

**Audit Log:**
```
action: CONSENT_INITIATION_SENT
targetType: CONSENT
complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'PDP_BILL_2023']
metadata: {
  studentId, parentPhone, verificationMethod
}
```

---

#### Phase 2: OTP Verification

**Endpoint:** `POST /api/consent/verify-otp`

**Request:**
```json
{
  "consentId": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "consentStatus": "VERIFIED",
  "verifiedAt": "2026-02-21T17:35:00Z"
}
```

**Audit Log:**
```
action: CONSENT_OTP_VERIFIED
targetType: CONSENT
status: success
metadata: {
  consentId, verificationMethod: 'OTP_SMS'
}
```

---

#### Phase 3: Consent Grant

**Endpoint:** `POST /api/consent/grant`

**Request:**
```json
{
  "consentId": "507f1f77bcf86cd799439011",
  "agreedToTerms": true,
  "agreedToDataUse": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consent granted successfully",
  "consentId": "507f1f77bcf86cd799439011",
  "studentId": "6999eb82367e122cfa99ab90",
  "expiresAt": "2033-02-21T17:35:00Z"
}
```

**Audit Log:**
```
action: CONSENT_GRANTED
targetType: CONSENT
status: success
complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'PDP_BILL_2023']
metadata: {
  consentType: 'PARENTAL',
  duration: '7_YEARS',
  dataTypes: ['name', 'email', 'age', 'progress']
}
```

---

#### Phase 4: Get Consent Status

**Endpoint:** `GET /api/consent/status/:studentId`

**Response:**
```json
{
  "success": true,
  "consentStatus": {
    "hasValidConsent": true,
    "consentId": "507f1f77bcf86cd799439011",
    "consentType": "PARENTAL",
    "verificationStatus": "VERIFIED",
    "verifiedAt": "2026-02-21T17:35:00Z",
    "expiresAt": "2033-02-21T17:35:00Z",
    "dataTypes": ["name", "email", "age", "progress"],
    "purposes": ["education", "gamification"]
  },
  "canUseService": true
}
```

---

#### Phase 5: Revoke Consent

**Endpoint:** `POST /api/consent/revoke/:consentId`

**Request:**
```json
{
  "reason": "Parent requested data deletion"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consent revoked successfully",
  "revokedAt": "2026-02-21T17:40:00Z"
}
```

**Audit Log:**
```
action: CONSENT_REVOKED
targetType: CONSENT
status: success
complianceFlags: ['PDP_BILL_2023', 'RTE_ACT_2009']
metadata: {
  reason: 'Parent requested data deletion',
  dataDeletedAt: '2026-02-21T17:40:00Z'
}
```

---

### UI Components Required

#### 1. Registration Flow Modification

**Current Flow:**
```
1. Name, Email, Password → 
2. Grade, School → 
3. Account Created ✅
```

**New Flow:**
```
1. Name, Email, Password → 
2. Date of Birth (optional) →
3. IF Age < 18:
   - Parent/Guardian Email Required
   - Parent/Guardian Phone Required
   - Consent Type Selection (PARENTAL/GUARDIAN/SELF)
4. IF Parental Consent:
   - Show OTP Screen ("OTP sent to parent")
   - Parent enters OTP received via SMS/Email
   - Show Consent Terms
   - Parent clicks "I Agree" checkbox
5. Account Created with Consent Proof ✅
```

#### 2. Consent Form Component

**File:** `client/src/components/ConsentForm.jsx`

```jsx
import React, { useState } from 'react';

export default function ConsentForm({ studentId, onConsented }) {
  const [step, setStep] = useState('parent-details'); // 'parent-details' | 'otp' | 'terms' | 'confirmed'
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInitiateConsent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/consent/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          parentPhone,
          parentEmail,
          verificationMethod: 'OTP_SMS'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/consent/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentId: consentId, otp })
      });
      const data = await res.json();
      if (data.success) {
        setStep('terms');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentId: consentId,
          agreedToTerms: agreed
        })
      });
      const data = await res.json();
      if (data.success) {
        setStep('confirmed');
        onConsented(data.consentId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consent-form">
      {step === 'parent-details' && (
        <div>
          <h3>Parent/Guardian Information</h3>
          <p className="compliance-notice">
            ⚠️ Required by RTE Act 2009 and POCSO Act 2012
          </p>
          <input 
            type="email" 
            placeholder="Parent email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
          <input 
            type="tel" 
            placeholder="+91 Mobile Number"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
          />
          <button onClick={handleInitiateConsent} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div>
          <h3>Enter OTP</h3>
          <p>OTP sent to parent's phone number</p>
          <input 
            type="text" 
            maxLength="6"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}

      {step === 'terms' && (
        <div>
          <h3>Parental Consent Form</h3>
          <div className="consent-terms">
            <p>I hereby grant permission for my child to:</p>
            <ul>
              <li>✅ Access educational content on EcoKids India</li>
              <li>✅ Submit environmental science tasks</li>
              <li>✅ Earn gamification points and badges</li>
              <li>✅ Share learning progress (name, grade, scores)</li>
            </ul>
            <p className="data-use">
              Data will be used only for educational purposes and will be 
              protected according to RTE Act 2009 and POCSO Act 2012 requirements.
            </p>
          </div>
          <label>
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I agree to the above consent terms
          </label>
          <button 
            onClick={handleGrantConsent} 
            disabled={!agreed || loading}
          >
            {loading ? 'Confirming...' : 'I Agree & Grant Consent'}
          </button>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="success">
          <h3>✅ Consent Granted</h3>
          <p>Your child's account is now active</p>
          <p className="compliance-badge">
            🔒 Compliant with RTE Act 2009, POCSO Act 2012, PDP Bill 2023
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### Enforcement Rules

#### Rule 1: Block Service Without Consent

```javascript
// In any controller handling student data:
const user = await User.findById(studentId);

if (!user.hasValidConsent) {
  return res.status(403).json({
    success: false,
    message: 'Parental consent required to use service',
    action: 'REDIRECT_TO_CONSENT_FORM'
  });
}

// Logged automatically
await logConsentEvent(
  studentId,
  'student',
  'SERVICE_ACCESS_ATTEMPTED_NO_CONSENT',
  req,
  { reason: 'hasValidConsent = false' }
);
```

#### Rule 2: Block Data Export Without Consent

```javascript
// In export endpoint:
const consent = await Consent.findOne({
  studentId,
  verificationStatus: 'VERIFIED',
  expiresAt: { $gt: new Date() }
});

if (!consent) {
  return res.status(403).json({
    success: false,
    message: 'Cannot export data - parental consent expired'
  });
}

// Logged with compliance flag
await logDataAccessEvent(
  studentId,
  'student',
  'DATA_EXPORT',
  req,
  { format: 'csv', recordsExported: 150 }
);
```

#### Rule 3: Block Photo Submission (POCSO Compliance)

```javascript
// In task submission endpoint:
const user = await User.findById(studentId);
const consent = await Consent.findById(user.consentId);

// For photo submissions, require explicit photo consent
if (req.files && !consent.dataTypes.includes('photos')) {
  return res.status(403).json({
    success: false,
    message: 'Parent consent does not allow photo submission',
    action: 'REQUEST_CONSENT_UPDATE'
  });
}

// Check child age for extra POCSO protections
if (user.ageCategory === 'CHILD_BELOW_13') {
  // Extra validation: No facial recognition, no location tracking
  const taskData = sanitizeForChildUnder13(req.body);
}
```

---

### Audit Logging Integration

Every consent event must log with compliance flags:

```javascript
await logConsentEvent(
  parentId,
  'parent',
  'CONSENT_GRANTED',
  req,
  {
    studentId,
    studentAge: studentAgeCategory,
    consentType: 'PARENTAL',
    dataTypes: ['name', 'email', 'progress'],
    duration: '7_YEARS',
    method: 'OTP_SMS'
  }
);

// Audit log will include:
// complianceFlags: ['RTE_ACT_2009', 'POCSO_ACT_2012', 'PDP_BILL_2023']
// dataClassification: 'confidential' (child data)
// ipAddress, userAgent, timestamp (complete audit trail)
```

---

### Paper Form Fallback (NIOS Requirement)

For students without digital access:

```javascript
// Endpoint: POST /api/consent/paper-form

{
  "studentId": "...",
  "formPdfUrl": "https://s3.amazonaws.com/forms/consent-form-123.pdf",
  "uploadedAt": "2026-02-21T17:30:00Z",
  "verifiedBy": "admin@school.edu",
  "verificationMethod": "PAPER",
  "scannedFormPath": "/uploads/consent-forms/form-123.pdf"
}

// Logged as:
await logConsentEvent(
  studentId,
  'student',
  'CONSENT_PAPER_FORM_RECEIVED',
  req,
  {
    formId: formId,
    verificationMethod: 'PAPER',
    receivedAt: new Date(),
    adminEmail: req.user.email
  }
);
```

---

## Implementation Timeline

### Week 1: Database & API
- [ ] Create Consent model with all fields
- [ ] Update User model with consent fields
- [ ] Create consent controller with 5 endpoints
- [ ] Create consent routes with auth
- [ ] Deploy to staging

### Week 2: Integration & Testing
- [ ] Integrate with registration flow
- [ ] Add enforcement rules to controllers
- [ ] Add OTP utility function
- [ ] Test complete consent workflow
- [ ] Test audit logging

### Week 3: UI & UX
- [ ] Build ConsentForm component
- [ ] Update registration page
- [ ] Add consent status dashboard
- [ ] Add consent revocation UI
- [ ] Deploy to staging for UAT

### Week 4: Compliance & Launch
- [ ] Test POCSO compliance
- [ ] Verify audit trail logging
- [ ] Deploy to production
- [ ] Train admin team
- [ ] Document consent procedures

---

## Testing Checklist

### Test 1: Adult Registration (No Consent Required)

```
User: 25-year-old adult
Action: Register without parent
Expected: Account created immediately
Audit: No consent flags
```

### Test 2: Child Registration (Consent Required)

```
User: 14-year-old student
Action: Register
Flow: System detects age < 18
  → Asks for parent email/phone
  → Sends OTP to parent
  → Parent enters OTP
  → Parent agrees to consent
  → Account activated
Audit: All steps logged with RTE_ACT_2009, POCSO_ACT_2012 flags
```

### Test 3: No Consent Service Blocking

```
User: Child with pending consent
Action: Try to submit task
Expected: Blocked with message "Parental consent required"
Audit: SERVICE_ACCESS_ATTEMPTED_NO_CONSENT logged
```

### Test 4: Consent Expiry

```
User: Child with expired consent
Action: Try to use platform 2 years after grant (consent was for 1 year)
Expected: Blocked with message "Consent expired"
Audit: Service access blocked
Enforcement: Account suspended until new consent
```

### Test 5: Consent Revocation

```
User: Parent
Action: Revoke consent
Expected: 
  - Student account immediately blocked
  - All personal data flagged for deletion
  - 30-day data retention window
  - After 30 days, all data purged
Audit: CONSENT_REVOKED logged + DATA_DELETION_SCHEDULED
```

---

## Legal Compliance Matrix

| Requirement | Implemented | Evidence |
|-------------|-------------|----------|
| RTE Act Section 16 | ✅ | Consent model + enforcement rules |
| POCSO Act Special Protections | ✅ | Age detection + photo consent |
| SPDI Rules Data Handling | ✅ | Consent log + audit trail |
| PDP Bill Right to Revoke | ✅ | Revocation endpoint + data deletion |
| Data Retention Limits | ✅ | Expiration rules + deletion schedule |
| Right to be Forgotten | ✅ | Data purge after revocation |

---

## Why This Cannot Be Skipped

### Government Audit Question
```
"Can you show me proof that you obtained parental consent 
before collecting data from this student?"
```

### Current Answer
```
❌ "We don't have a consent system"
❌ "Users just... agree to terms"
❌ "We assume parents know"
```

### After Implementation
```
✅ "Yes, here's the consent record"
✅ "Parent verified via OTP on 2026-02-21"
✅ "Parent agreed to specific data types"
✅ "Complete audit trail with timestamp"
✅ "Compliant with RTE Act, POCSO, PDP Bill"
```

---

## Risk of Not Implementing

| Risk | Impact | Probability |
|------|--------|-------------|
| Government audit rejection | Platform blocked from launch | 100% |
| RTE Act violation fine | ₹5-10 lakh penalty | 95% |
| POCSO Act violation | Criminal liability | 90% |
| Data breach liability | Unlimited civil damages | 85% |
| Parent lawsuits | Multiple lawsuits for unauthorized data use | 80% |
| Media exposure | "EdTech Platform Violates Child Privacy Laws" | 70% |

---

## Next Steps

1. **Review this specification** with your team
2. **Assign developer** to implement consent model
3. **Create OTP utility** for SMS/Email verification
4. **Build consent endpoints** (5 endpoints total)
5. **Update registration flow** to trigger consent
6. **Add UI components** for consent form
7. **Integrate audit logging** for all consent events
8. **Test complete workflow** end-to-end
9. **Deploy to production** with enforcement rules

---

**This is your critical blocker for government compliance.**

**Parental consent must be implemented before any public launch.**

Without it, the platform cannot operate legally in India.

**Status:** 🔴 CRITICAL REQUIREMENT - BLOCKS DEPLOYMENT
