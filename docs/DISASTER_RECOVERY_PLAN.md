# PHASE 4: DISASTER RECOVERY PLAN

## Executive Summary

This document defines the disaster recovery procedures for **EcoKids India**, ensuring no single failure can permanently destroy consent records or audit logs required for government compliance.

**Compliance Standards:**
- RTE Act 2009 (Right to Education)
- POCSO Act 2012 (Protection of Children from Sexual Offences)
- PDP Bill 2023 (Personal Data Protection)
- ISO 27001 (Information Security Management)

**Recovery Time Objective (RTO):** < 4 hours  
**Recovery Point Objective (RPO):** < 24 hours  
**Backup Retention:** 90 days

---

## Critical Data Assets

These collections contain legally required compliance data:

| Collection | Purpose | Compliance Requirement |
|---|---|---|
| `audit_logs` | Complete audit trail of all system actions | ISO 27001, RTE Act 2009 |
| `parental_consents` | Legal consent records with OTP verification | RTE Act 2009, POCSO Act 2012 |
| `users` | Identity records with role assignments | PDP Bill 2023 |
| `progresses` | Student learning history | RTE Act 2009 |
| `quiz_attempts` | Assessment records | RTE Act 2009 |
| `experiment_submissions` | Student work submissions | RTE Act 2009 |

**Legal Requirement:** If these records are lost, legally they never existed. Deployment can be revoked.

---

## Backup Architecture

### 1. Backup Generator

**Technology:** MongoDB `mongodump` with gzip compression

**Process:**
1. Extract critical collections from MongoDB
2. Compress using tar.gz (reduces size by ~70%)
3. Encrypt using AES-256-GCM
4. Upload to Google Cloud Storage
5. Log audit event for compliance trail
6. Delete local copies
7. Clean up backups older than 90 days

**Frequency:** Daily at 2:00 AM UTC

### 2. Backup Storage

**Provider:** Google Cloud Storage  
**Bucket:** `ecokids-compliance-backups`  
**Region:** Multi-region (for disaster resilience)  
**Access:** Service account with encryption keys

**Security:**
- Encrypted at rest (GCS default encryption)
- Encrypted in transit (TLS 1.3)
- Application-level encryption (AES-256-GCM)
- Immutable storage (versioning enabled)

### 3. Backup Encryption

**Algorithm:** AES-256-GCM (Galois/Counter Mode)  
**Key Management:** Environment variable `BACKUP_ENCRYPTION_KEY`  
**Key Rotation:** Quarterly (manual process documented below)

**Why AES-256-GCM:**
- NIST approved for government use
- Authenticated encryption (prevents tampering)
- Performance optimized (hardware acceleration)
- ISO 27001 compliant

### 4. Backup Restoration

**Tools:**
- `scripts/restore.js` - Interactive restore utility
- `scripts/backup.js` - Manual backup trigger

**Capabilities:**
- List all available backups
- Preview backup metadata
- Restore from specific backup
- Restore latest backup
- Audit log all restore operations

---

## Disaster Scenarios & Recovery Procedures

### Scenario 1: Complete Database Loss

**Example:** MongoDB server disk failure, entire database corrupted

**Detection:**
- Application errors: "Cannot connect to MongoDB"
- Monitoring alerts: Database connection failures

**Recovery Procedure:**

```bash
# Step 1: Verify MongoDB is accessible
mongosh --eval "db.version()"

# Step 2: List available backups
node scripts/restore.js --list

# Step 3: Restore latest backup
node scripts/restore.js --latest --reason="Complete database loss recovery"

# Step 4: Verify restoration
mongosh ecokids --eval "
  print('Consent records:', db.parental_consents.countDocuments({}));
  print('Audit logs:', db.audit_logs.countDocuments({}));
  print('Users:', db.users.countDocuments({}));
"

# Step 5: Restart application
pm2 restart ecokids-server
```

**Expected Recovery Time:** 30-60 minutes  
**Data Loss:** < 24 hours (last backup)

---

### Scenario 2: Accidental Collection Deletion

**Example:** DevOps script deletes `parental_consents` collection

**Detection:**
- Application errors: "Parental consent required" for all students
- Monitoring alerts: Zero consent records

**Recovery Procedure:**

```bash
# Step 1: Stop application to prevent further changes
pm2 stop ecokids-server

# Step 2: Create emergency backup of current state
node scripts/backup.js --reason="Pre-recovery snapshot"

# Step 3: Download latest backup without restoring
node scripts/restore.js --list

# Step 4: Selective restore (restore only parental_consents collection)
# This requires manual mongorestore with --nsInclude flag

mongosh ecokids --eval "db.parental_consents.drop()"  # Clear corrupted data

# Download and decrypt backup
node scripts/restore.js --file=backups/backup-2026-02-22.tar.gz.encrypted

# Extract and restore specific collection
tar -xzf /path/to/backup.tar.gz
mongorestore --uri="mongodb://localhost:27017/ecokids" \
  --nsInclude="ecokids.parental_consents" \
  --gzip \
  /path/to/backup/ecokids/

# Step 5: Verify restoration
mongosh ecokids --eval "print('Consent records:', db.parental_consents.countDocuments({}))"

# Step 6: Restart application
pm2 start ecokids-server
```

**Expected Recovery Time:** 15-30 minutes  
**Data Loss:** < 24 hours

---

### Scenario 3: Ransomware Attack

**Example:** Ransomware encrypts MongoDB data files

**Detection:**
- Application errors: Cannot read database files
- Unusual system activity: Mass file encryption
- Ransom note appears

**Recovery Procedure:**

```bash
# Step 1: IMMEDIATE ISOLATION
# Disconnect server from network to prevent spread
sudo iptables -A INPUT -j DROP
sudo iptables -A OUTPUT -j DROP

# Step 2: Document for forensics
ls -lah /var/lib/mongodb/  # Record encrypted file timestamps
ps aux > /tmp/process-snapshot.txt
netstat -tulpn > /tmp/network-snapshot.txt

# Step 3: Provision clean MongoDB server
# DO NOT restore to infected server - provision new server

# Step 4: Restore from backup on clean server
# On NEW clean server:
node scripts/restore.js --latest --reason="Ransomware recovery"

# Step 5: Update application to point to new MongoDB instance
# Update MONGO_URI in .env file

# Step 6: Restart application on new server
pm2 restart ecokids-server

# Step 7: Report to authorities
# Contact local cyber crime unit
# Contact GCP security team
```

**Expected Recovery Time:** 2-4 hours  
**Data Loss:** < 24 hours  
**Note:** Old infected server must be forensically analyzed before destruction

---

### Scenario 4: Cloud Provider Outage

**Example:** Google Cloud Storage region outage, backups inaccessible

**Detection:**
- GCS API returns 503 errors
- Cannot list or download backups

**Recovery Procedure:**

```bash
# Step 1: Check GCP status page
# https://status.cloud.google.com/

# Step 2: Verify if issue is regional or global
gsutil ls gs://ecokids-compliance-backups/

# Step 3: If regional outage, wait for recovery (GCP SLA: 99.95% uptime)

# Step 4: If extended outage, restore from local backup if available
# (Only if BACKUP_KEEP_LOCAL_COPY=true was set)

# Step 5: Once GCS recovers, verify backup integrity
node scripts/restore.js --list

# Step 6: If needed, trigger new backup
node scripts/backup.js --reason="Post-outage verification backup"
```

**Expected Recovery Time:** Depends on GCP SLA (typically < 4 hours)  
**Data Loss:** None (application continues running with existing data)

---

### Scenario 5: Operator Error During Maintenance

**Example:** Database administrator runs wrong migration script, corrupts data

**Detection:**
- Application errors after migration
- Data validation failures
- Unexpected data changes

**Recovery Procedure:**

```bash
# Step 1: STOP ALL CHANGES IMMEDIATELY
pm2 stop ecokids-server

# Step 2: Create snapshot of current (corrupted) state
node scripts/backup.js --reason="Post-migration corruption snapshot"

# Step 3: Identify last known good backup (before migration)
node scripts/restore.js --list
# Look for backup timestamp BEFORE migration

# Step 4: Restore from pre-migration backup
node scripts/restore.js --file=backups/backup-2026-02-21-23-00-00.tar.gz.encrypted \
  --reason="Rollback after failed migration"

# Step 5: Verify data integrity
node scripts/verify-data-integrity.js  # (to be created)

# Step 6: Review migration script for errors
# Fix script before attempting again

# Step 7: Restart application
pm2 start ecokids-server
```

**Expected Recovery Time:** 30-60 minutes  
**Data Loss:** Any changes made after last backup (< 24 hours)

---

## Backup Verification & Testing

### Monthly Restore Test (Mandatory)

**Schedule:** First Saturday of every month at 10:00 AM  
**Purpose:** Verify backup system is operational and restores work

**Procedure:**

```bash
# 1. Create test MongoDB instance (separate from production)
docker run -d -p 27018:27017 --name mongodb-restore-test mongo:latest

# 2. Restore latest backup to test instance
MONGO_URI="mongodb://localhost:27018/ecokids-test" \
  node scripts/restore.js --latest --reason="Monthly restore test"

# 3. Verify all critical collections exist
mongosh mongodb://localhost:27018/ecokids-test --eval "
  print('=== RESTORE TEST VERIFICATION ===');
  print('Consent records:', db.parental_consents.countDocuments({}));
  print('Audit logs:', db.audit_logs.countDocuments({}));
  print('Users:', db.users.countDocuments({}));
  print('Progress records:', db.progresses.countDocuments({}));
"

# 4. Document test results
echo "Restore test passed on $(date)" >> /var/log/backup-tests.log

# 5. Cleanup test instance
docker stop mongodb-restore-test
docker rm mongodb-restore-test
```

**Compliance Requirement:** Government auditors will request proof of restore testing.

---

## Backup Monitoring & Alerting

### Critical Alerts

**1. Backup Failure**
- **Trigger:** Scheduled backup fails
- **Action:** Notify administrators immediately
- **Escalation:** After 3 consecutive failures, escalate to management

**2. Missing Backup**
- **Trigger:** No backup in last 48 hours
- **Action:** Notify administrators
- **Escalation:** Immediate escalation (compliance violation)

**3. Restore Failure**
- **Trigger:** Restore operation fails
- **Action:** Notify administrators and security team
- **Escalation:** Immediate escalation (disaster recovery at risk)

**4. Encryption Key Rotation Overdue**
- **Trigger:** Encryption key not rotated in 90 days
- **Action:** Notify security team
- **Escalation:** Weekly reminders until completed

### Health Check Endpoint

```bash
# Check backup scheduler health
curl http://localhost:5001/api/backup/health
```

**Response:**
```json
{
  "status": "OK",
  "schedule": "0 2 * * *",
  "lastBackupTime": "2026-02-22T02:00:00.000Z",
  "lastBackupStatus": "SUCCESS",
  "consecutiveFailures": 0,
  "nextBackupTime": "2026-02-23T02:00:00.000Z",
  "backupCount": 45,
  "oldestBackup": "2026-01-01T02:00:00.000Z",
  "newestBackup": "2026-02-22T02:00:00.000Z"
}
```

---

## Encryption Key Management

### Key Rotation Procedure (Quarterly)

**Schedule:** January 1, April 1, July 1, October 1

**Procedure:**

```bash
# Step 1: Generate new encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6...

# Step 2: Update environment variable
# Edit .env file:
# OLD_BACKUP_ENCRYPTION_KEY=<old-key>  # Keep for old backups
# BACKUP_ENCRYPTION_KEY=<new-key>      # Use for new backups

# Step 3: Update backupService.js to support dual-key decryption
# (Allow decryption with either old or new key for transition period)

# Step 4: Create new backup with new key
node scripts/backup.js --reason="Post-key-rotation verification backup"

# Step 5: Test restore from old backup (uses old key)
node scripts/restore.js --list
# Select backup from before rotation
# Verify it still restores successfully

# Step 6: Test restore from new backup (uses new key)
# Select backup from after rotation
# Verify it restores successfully

# Step 7: After 90 days, remove OLD_BACKUP_ENCRYPTION_KEY
# All backups older than 90 days are auto-deleted (retention policy)
```

---

## Roles & Responsibilities

### Backup System Owner
**Role:** DevOps Lead / Infrastructure Engineer  
**Responsibilities:**
- Maintain backup scheduler uptime
- Monitor backup success/failure
- Execute monthly restore tests
- Manage encryption key rotation
- Update disaster recovery documentation

### Disaster Recovery Coordinator
**Role:** CTO / Technical Director  
**Responsibilities:**
- Authorize restore operations
- Coordinate disaster recovery execution
- Communicate with stakeholders during incidents
- Review post-incident reports
- Ensure compliance with government requirements

### Compliance Officer
**Role:** Legal / Compliance Manager  
**Responsibilities:**
- Verify backup retention compliance
- Audit disaster recovery testing
- Maintain compliance documentation
- Coordinate with government auditors
- Approve changes to backup policies

---

## Compliance Documentation

### Required Records (Government Audit)

Auditors will request proof of:

1. **Backup Schedule Documentation** ✅
   - Location: This document (DISASTER_RECOVERY_PLAN.md)
   - Evidence: Cron schedule in `scripts/scheduler.js`

2. **Backup Success Records** ✅
   - Location: `audit_logs` collection (action: BACKUP_COMPLETED)
   - Query: `db.audit_logs.find({action: 'BACKUP_COMPLETED'}).sort({timestamp: -1})`

3. **Restore Test Records** ✅
   - Location: `/var/log/backup-tests.log` + `audit_logs` collection
   - Query: `db.audit_logs.find({action: 'RESTORE_COMPLETED', 'metadata.reason': /test/i})`

4. **Encryption Implementation** ✅
   - Location: `server/services/backupService.js` (encryptFile method)
   - Algorithm: AES-256-GCM (NIST approved)

5. **Data Retention Policy** ✅
   - Retention: 90 days
   - Location: `backupService.js` (retentionDays = 90)
   - Cleanup: Automated in `cleanupOldBackups()` method

### Auditor Demonstration Script

When auditors request restore capability demonstration:

```bash
# Step 1: Show backup history
node scripts/restore.js --list

# Step 2: Show backup encryption
echo "Encryption algorithm: AES-256-GCM (NIST approved)"
echo "Key length: 256 bits"
grep -A 5 "encryptFile" server/services/backupService.js

# Step 3: Show backup schedule
grep "BACKUP_SCHEDULE" server/scripts/scheduler.js

# Step 4: Show restore test history
tail -20 /var/log/backup-tests.log

# Step 5: Execute live restore test
# (To separate test database - NEVER to production during demo!)
docker run -d -p 27018:27017 --name audit-demo mongo:latest
MONGO_URI="mongodb://localhost:27018/ecokids" \
  node scripts/restore.js --latest --reason="Auditor demonstration"

# Step 6: Verify restored data
mongosh mongodb://localhost:27018/ecokids --eval "
  print('Consent records:', db.parental_consents.countDocuments({}));
  print('Audit logs:', db.audit_logs.countDocuments({}));
"

# Step 7: Cleanup
docker stop audit-demo && docker rm audit-demo
```

---

## Appendix A: Environment Variables

Required configuration in `.env`:

```bash
# Google Cloud Storage Configuration
GCS_PROJECT_ID=ecokids-india
GCS_BACKUP_BUCKET=ecokids-compliance-backups
GCS_KEY_PATH=/path/to/service-account-key.json

# Backup Encryption
BACKUP_ENCRYPTION_KEY=<64-character-hex-string>  # 256-bit key

# Backup Schedule
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM UTC
BACKUP_TIMEZONE=UTC
BACKUP_RETENTION_DAYS=90

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/ecokids

# Optional
BACKUP_ON_STARTUP=false  # Set to 'true' for testing
BACKUP_KEEP_LOCAL_COPY=false  # For disaster scenarios
```

---

## Appendix B: Cost Estimation

### Google Cloud Storage Costs (Monthly)

**Assumptions:**
- Database size: 5 GB
- Compressed + encrypted backup size: ~1.5 GB
- Daily backups: 30/month
- Retention: 90 days

**Storage:**
- 90 backups × 1.5 GB = 135 GB
- Multi-region storage: $0.026/GB/month
- **Cost: $3.51/month**

**Operations:**
- Upload operations: 30/month (Class A)
- Download operations: ~2/month (Class A, restore tests)
- **Cost: ~$0.02/month**

**Total: ~$3.53/month** (₹295/month)

**Compliance value:** Priceless. Cannot deploy without it.

---

## Appendix C: Contact Information

### Emergency Contacts

**Backup System Issues:**
- Primary: DevOps Lead (+91-XXXX-XXXXXX)
- Secondary: CTO (+91-XXXX-XXXXXX)

**GCP Support:**
- Support Portal: https://console.cloud.google.com/support
- Phone: Contact your GCP account manager

**Government Compliance Queries:**
- Compliance Officer (+91-XXXX-XXXXXX)

---

## Document Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-02-22 | System | Initial Phase 4 implementation |

---

## Approval Signatures

**Prepared by:** DevOps Engineer  
**Date:** February 22, 2026

**Reviewed by:** CTO  
**Date:** _______________

**Approved by:** Compliance Officer  
**Date:** _______________

---

**End of Disaster Recovery Plan**

*This document must be reviewed quarterly and updated as needed.*
