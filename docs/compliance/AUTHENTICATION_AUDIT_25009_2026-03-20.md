# Authentication Audit and Requirements Checklist
Date: 2026-03-20
Scope: Ecokids India web, API, and mobile code currently in repository

Status legend:
- [x] Implemented
- [ ] Missing
- [ ] Partial (noted inline)
- [ ] Decision Needed (product or policy decision)

## Section 1: Current State Assessment

### 1.1 Basic Infrastructure
- [x] Backend server/API setup complete
- [x] Database selected and configured (MongoDB + Mongoose)
- [x] Frontend framework chosen (React + Vite)
- [x] Mobile app framework selected (React Native + Expo, codebase is partial)
- [ ] Cloud provider chosen (deployment artifacts exist, but single provider decision is not explicit)
- [x] Development environment ready

### 1.2 User Management System
- [x] User model created in database
- [x] User roles/permissions system exists
- [x] User profile schema defined
- [x] Password hashing mechanism in place (bcrypt)
- [x] Session/token management exists (JWT + refresh token rotation)
- [ ] User logout implemented fully (partial: logout endpoint exists, but default client flow does not revoke refresh token)

### 1.3 Authentication Methods Currently Implemented
- [x] Email/password login
- [x] Phone number OTP login
- [ ] Social login (Google/Microsoft/Facebook)
- [ ] SSO/SAML integration
- [x] API key authentication (integration routes)
- [ ] OAuth 2.0 provider setup (as social/enterprise IdP)
- [ ] Multi-factor authentication for staff/admin (not enforced)
- [ ] Biometric authentication
- [x] QR token login flow for students
- [x] Appwrite email OTP flow for students

### 1.4 Security Measures Already in Place
- [x] HTTPS/TLS support at deployment edge (headers and reverse proxy patterns present)
- [x] Password encryption (bcrypt)
- [x] JWT implementation
- [x] Token refresh mechanism
- [x] Rate limiting on auth endpoints
- [ ] CSRF protection (no explicit CSRF token strategy detected)
- [x] CORS configured
- [x] Audit logging system
- [x] Brute-force attack prevention
- [x] Account lockout mechanism
- [x] Security headers (CSP, HSTS, X-Frame-Options, etc.)

### 1.5 User Roles/Types Already Defined
- [x] Student role
- [x] Teacher/Coordinator role
- [x] School Admin role
- [x] NGO/Government-facing role model and integration scope
- [ ] Parent role as first-class auth role (parent data and consent flows exist, but not a distinct parent account role in core role enum)
- [x] Super Admin equivalent exists (admin/state_admin hierarchy)

### 1.6 Third-Party Services Integrated
- [x] Email service (SMTP/nodemailer usage)
- [x] SMS service (FAST2SMS)
- [ ] OAuth providers (Google/Microsoft)
- [x] Identity provider integration (Appwrite session/OTP flow)
- [ ] School SSO system

### 1.7 User Data Currently Collected
- [x] Email
- [x] Phone
- [x] Password
- [x] Full name
- [x] School/Institution references
- [x] Date of birth (profile field)
- [x] Parent/guardian info
- [x] User role/type
- [x] Avatar/profile photo field

## Section 2: Needs Assessment by User Type (Current Fit)

### 2.1 Student
- [x] Email/password registration and login
- [x] School code registration route
- [x] Phone OTP login
- [x] Password reset flow
- [x] Profile editing
- [x] Account deactivation/deletion scheduling flows
- [x] Parental consent framework and routes
- [ ] Email verification mandatory for all student registrations
- [ ] Remember me behavior explicitly implemented
- [ ] Concurrent session limits enforcement
- [ ] Biometric login

### 2.2 Teacher/Coordinator
- [x] Email/password login and role-based dashboards
- [x] Student management/task/verification permissions via RBAC routes
- [x] Audit trails available
- [ ] School email domain enforcement
- [ ] Mandatory 2FA
- [ ] Forced password rotation policy
- [ ] Device management and IP whitelist controls
- [ ] School SSO

### 2.3 School Admin
- [x] Role-based school admin access and dashboards
- [x] Teacher/student management flows
- [x] School analytics/reporting routes
- [x] Audit logging patterns in place
- [ ] Mandatory MFA for school admins
- [ ] Advanced session governance (concurrency limits/device controls)
- [ ] School domain verification and single-admin policy governance rules

### 2.4 NGO/Government
- [x] API key auth
- [x] Scoped access model (state/district/national style scope fields)
- [x] Aggregated reporting endpoints
- [x] Integration access logging
- [ ] API key rotation workflow automation
- [ ] Per-key rate limiting (explicit integration limiter not found)
- [ ] OAuth2 client credentials flow

### 2.5 Parent/Guardian
- [x] Parent consent verification and management workflows
- [x] Parent-linked data elements on student profile
- [ ] Parent account login role and dedicated parent portal auth
- [ ] Parent device/session governance

## Section 3: Technical Implementation Checklist (Condensed)

### 3.1 Backend
- [x] User schema/model
- [x] Password hashing
- [x] JWT secret usage
- [x] Token expiry definitions (access + refresh)
- [x] Login/register/logout endpoints
- [x] Password reset endpoints
- [x] Refresh endpoint
- [x] RBAC middleware
- [x] Rate limiting middleware
- [x] CORS config
- [x] Auth error handling
- [ ] Signup transaction boundaries for all coupled writes (consent write currently best effort)

### 3.2 Frontend
- [x] Login/register pages
- [x] Password reset links and API methods
- [x] Protected routes
- [x] Permission-based UI rendering
- [x] Error and loading states
- [ ] Token storage strategy is consistent (currently mixed cookie + localStorage + sessionStorage patterns)
- [ ] Remember me
- [ ] Session timeout warning UX
- [ ] Social login buttons/providers

### 3.3 Security
- [x] Security headers
- [x] Input validation middleware
- [x] NoSQL injection sanitization
- [x] Brute force and lockout controls
- [x] Rate limiting
- [x] Sensitive audit logging available
- [ ] Explicit CSRF token implementation
- [ ] Guaranteed HTTPS redirect inside app tier (usually done at ingress)
- [ ] PII encryption-at-rest strategy clearly defined in data layer

### 3.4 Third-Party Integration
- [x] Email and SMS integration hooks
- [x] Appwrite OTP integration
- [ ] Social OAuth provider credentials and scopes
- [ ] Provider token refresh strategy (for social providers)

### 3.5 Database Schema
- [x] Users table equivalent with auth/security fields
- [x] Password hash field
- [x] Audit log collection
- [x] Consent and verification artifacts
- [x] Integration key collection
- [x] Indexes on common auth fields
- [ ] Dedicated normalized roles-permissions model (currently enum + middleware pattern)
- [ ] Formal data retention automation policy implementation for all auth records

### 3.6 Testing and QA
- [x] Auth tests exist (OTP and related auth behavior)
- [x] RBAC tests/scripts exist
- [ ] Comprehensive integration test coverage for full auth matrix by role
- [ ] Security penetration tests documented in repo
- [ ] CSRF test coverage
- [ ] Social login and MFA tests (not implemented)

## Section 4: Compliance and Privacy
- [x] DPDP-oriented consent and privacy flows
- [x] Data export/deletion endpoints
- [x] Audit/event logging for compliance actions
- [x] Disaster recovery and retention-oriented documentation present
- [ ] COPPA-specific controls and legal posture explicitly mapped
- [ ] GDPR-specific controls and legal posture explicitly mapped
- [ ] Public privacy policy and terms pages verified in current app routes

## Section 5: Deployment and Monitoring
- [x] Staging/production style deployment artifacts exist (Docker, K8s, monitoring)
- [x] Environment-variable based secret usage patterns exist
- [x] Monitoring stack and health/metrics endpoints exist
- [x] Failed/success login logging support in audit framework
- [ ] Secrets vault usage enforced and documented
- [ ] Auth-specific suspicious activity alert rules are explicit and verified

## Section 6: Priority Fit vs Requirement

### Critical (MVP)
- [x] Student email/password login
- [x] Teacher login + role enforcement
- [x] School admin account patterns
- [x] Basic RBAC
- [x] Password reset flow
- [x] Secure password storage
- [x] Session management baseline
- [x] Logout endpoint exists
- [ ] Logout hard invalidation in default client flow (needs revoke endpoint wiring)

### High
- [x] Teacher permissions and progress tracking capabilities
- [x] Email notifications foundation
- [x] Mobile auth support (partial implementation quality)
- [x] Audit logging
- [x] NGO API-key capability
- [ ] 2FA for teachers/admins
- [ ] Social login

### Medium and Low
- [ ] Biometric login
- [ ] School SSO
- [ ] Parent account auth
- [ ] Device fingerprinting
- [ ] Advanced custom RBAC

## Section 7: Immediate Decisions Needed
- [x] Authentication provider currently appears custom with Appwrite-assisted OTP
- [ ] Decide final direction: pure custom vs managed IdP consolidation
- [x] Roles currently in use: student, teacher, school_admin, district_admin, state_admin, ngo_coordinator, admin
- [x] Mobile target appears both iOS and Android via Expo
- [ ] Timeline and staffing inputs need product/management confirmation

## Critical Blockers
1. Logout path inconsistency: current client logout uses /auth/logout, but refresh token revocation is separate (/auth/revoke), risking continued token refresh after logout.
2. Mixed token storage strategy across channels (HttpOnly cookie, localStorage, sessionStorage, AsyncStorage) increases attack surface and operational inconsistency.
3. Staff/admin hardening gaps for production compliance: no enforced MFA, no device/session governance, no IP restrictions.
4. NGO integration hardening gaps: no explicit per-key limiter and no first-class key rotation workflow.

## Recommended Next Steps (Priority Order)
1. Merge logout + revoke behavior into one guaranteed server flow and update all clients to use it.
2. Standardize token/session strategy by channel (web cookie-first, mobile secure storage with refresh discipline) and remove localStorage token writes.
3. Add MFA (TOTP or OTP challenge) for teacher/school_admin/district_admin/state_admin roles.
4. Add integration API key rotation endpoint and per-key rate limiting.
5. Complete compliance mapping matrix for COPPA/GDPR/DPDP with policy publication checkpoints.
6. Expand auth integration tests to include role matrix, refresh-revoke lifecycle, and multi-client logout behavior.

## Evidence Pointers
- Core auth routes and refresh/revoke separation: server/routes/auth.js
- Auth controller token lifecycle: server/controllers/auth.js
- Password hashing and JWT model methods: server/models/User.js
- JWT protect middleware and role middleware: server/middleware/auth.js, server/middleware/requireRole.js
- Lockout and auth rate limiting: server/middleware/accountLockout.js, server/middleware/rateLimiter.js
- Security middleware stack: server/server.js, server/middleware/securityHeaders.js
- Integration API key auth: server/middleware/integrationAuth.js, server/models/IntegrationKey.js
- Web token storage behavior: client/src/pages/auth/Login.jsx, client/src/utils/api.js
- Mobile token storage behavior: mobile/src/services/storage.js, mobile/src/services/api.js
- Consent/privacy/compliance artifacts: server/models/ParentalConsent.js, server/routes/consentRoutes.js, server/routes/privacy.js, server/routes/compliance.js
