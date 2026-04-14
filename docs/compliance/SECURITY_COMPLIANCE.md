# Security Compliance

## 1. Authentication and Authorization

- JWT-based auth middleware protects private APIs.
- Role-aware access control exists for student, teacher, admin paths.
- Activity review endpoints gate teacher/admin privileges.

## 2. Data Protection Controls

- Sensitive config handled via environment variables.
- Password hashing and auth lifecycle implemented in auth controllers/services.
- Notification and audit trails support post-incident review.

## 3. API Hardening in Current Stack

- Request validation and sanitization patterns in middleware/controllers
- Rate limiting settings via environment configuration
- CORS configuration for frontend origin
- Security-focused dependencies and middleware present in server stack

## 4. Child Safety and Educational Context

- Existing project docs include parental consent specification and operational guides.
- Data handling must remain minimal for student PII and evidence metadata.

## 5. Compliance Checklist (Operational)

- Privacy notice published and versioned
- Consent capture and consent evidence retained
- User data export and deletion workflow documented
- Security incident response runbook maintained
- Dependency audits scheduled and tracked

## 6. Required Production Controls Before National Scale

- Secrets manager migration for all production credentials
- Mandatory HTTPS + HSTS at edge
- Structured audit logging for all privileged actions
- Periodic penetration test and remediation cadence
- Backup/restore drills with RTO/RPO evidence
