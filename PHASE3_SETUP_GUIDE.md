# Phase 3 Appwrite Infrastructure Setup Guide

## Status Summary
✅ **Infrastructure Complete** - All backend scaffolding, frontend services, and npm dependencies in place
⚠️ **Action Required** - Need to add real APPWRITE_API_KEY from console before executing setup scripts

---

## 1. Getting APPWRITE_API_KEY

### Step 1: Login to Appwrite Console
- Navigate to: https://sgp.cloud.appwrite.io
- Login with your credentials
- Project ID: `69b6ea3b0010c4b2e448`

### Step 2: Create/Get API Key
1. Go to **Settings** → **Integrations** (or **API Keys**)
2. Click **Create API Key**
3. Name: `Phase 3 Development` (or similar)
4. **IMPORTANT**: Under "Scopes", grant these permissions:
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write`
   - ✅ `documents.read`
   - ✅ `documents.write`
   - ✅ `indexes.read`
   - ✅ `indexes.write`
   - ✅ `attributes.read`
   - ✅ `attributes.write`
   - ✅ `files.read`
   - ✅ `files.write`
   - ✅ `buckets.read`
   - ✅ `buckets.write`

### Step 3: Copy & Update
1. Copy the generated **secret key** (shown once only)
2. Update `server/.env`:
   ```
   APPWRITE_API_KEY=<your_secret_key_here>
   ```

---

## 2. Verify Configuration

### Test Connection
```bash
cd /Users/kumarmangalam/Desktop/Cap\ project/ecokids-india
npm run test-appwrite
```

**Expected Output:**
```
═══════════════════════════════════════════════
APPWRITE CONNECTION VERIFICATION
═══════════════════════════════════════════════

Test 1: Configuration...
✓ Configuration present

Test 2: Project Access...
  Project ID: 69b6ea3b0010c4b2e448
  Database ID: ecokids_main
✓ Project configured

Test 3: Client Status...
✓ Appwrite client initialized

Test 4: Module Availability...
  ✓ database
  ✓ storage
  ✓ functions
  ✓ messaging

═══════════════════════════════════════════════
✅ APPWRITE ACCOUNT VERIFIED & READY
═══════════════════════════════════════════════
```

---

## 3. Phase 3.1: Create Appwrite Infrastructure

### Setup Database & Collections (5-10 minutes)

```bash
npm run phase3:setup
```

**What this does:**
1. Creates database: `ecokids_main`
2. Creates 8 collections:
   - `users` - Student/teacher profiles
   - `challenges` - School challenges
   - `submissions` - Challenge submissions
   - `eco_points` - Student point tracking
   - `badges` - Achievement badges
   - `leaderboards` - School rankings
   - `audit_logs` - System audit trail
   - `refresh_tokens` - Token management

3. Creates 6 indexes for performance:
   - `email_unique` on users.email
   - `role_schoolId` on users.role + users.schoolId
   - `studentId_status` on submissions.studentId + submissions.status
   - `studentId_schoolId_unique` on eco_points (composite unique)
   - `schoolId` on challenges.schoolId
   - `challengeId` on submissions.challengeId

**Expected output:**
```
✅ PHASE 3.1 COMPLETE - Appwrite infrastructure setup successful
✓ Database created: ecokids_main
✓ Collection created: users
✓ Collection created: challenges
... (6 more collections)
✓ Index created: email_unique
... (5 more indexes)
```

---

## 4. Phase 3.2: Add Attributes & Test Data (5-10 minutes)

### Add All Collection Attributes
```bash
npm run phase3:add-attrs
```

**What this does:**
- Adds typed attributes to all 8 collections
- Each attribute includes proper data types (string, integer, boolean, datetime, email, URL)
- Creates required/optional constraints
- Sets default values where applicable

**Expected output:**
```
Adding attributes to users...
✓ Added email attribute
✓ Added password attribute
... (15+ more attributes)
✓ PHASE 3.2a COMPLETE - All attributes added
```

### Seed Test Data
```bash
npm run phase3:seed
```

**What this does:**
- Creates 3 test users:
  - `student@ecokids.test` (Student)
  - `teacher@ecokids.test` (Teacher)
  - `admin@ecokids.test` (Admin)
  
- Creates 2 test challenges:
  - "Plant a Tree" (Plant category, 100 points)
  - "Waste Segregation" (Waste category, 50 points)

**Expected output:**
```
Creating test users...
✓ Created student@ecokids.test
✓ Created teacher@ecokids.test
✓ Created admin@ecokids.test

Creating test challenges...
✓ Created challenge: Plant a Tree
✓ Created challenge: Waste Segregation

✅ PHASE 3.2b COMPLETE - Test data seeded
```

### Verify CRUD Operations
```bash
node test-phase32-crud.js
```

**What this tests:**
- CREATE: Add a test document
- READ: Retrieve the document
- UPDATE: Modify a field
- DELETE: Remove the document

**Expected output:**
```
═══════════════════════════════════════════════
PHASE 3.2c - CRUD OPERATIONS TEST
═══════════════════════════════════════════════

Testing CRUD operations on 'test_collection'...

✓ CREATE: Document created (ID: ...)
✓ READ: Document retrieved successfully
✓ UPDATE: Document updated (updatedAt changed)
✓ DELETE: Document deleted successfully

═══════════════════════════════════════════════
✅ PHASE 3.2c COMPLETE - All CRUD operations working
═══════════════════════════════════════════════
```

---

## 5. File Inventory

### Backend Infrastructure
- `server/config/appwrite-config.js` - Configuration & credentials
- `server/config/appwrite-client.js` - Singleton SDK wrapper
- `server/schemas/collections.js` - 8 collection definitions
- `server/setup/appwrite-setup.js` - Setup orchestration class

### Execution Scripts
- `scripts/setup-phase3.js` - Create database, collections, indexes
- `scripts/add-attributes.js` - Add typed attributes
- `scripts/seed-test-data.js` - Populate test data

### Verification Scripts
- `test-appwrite-connection.js` - Verify SDK configuration
- `test-phase32-crud.js` - Test CRUD operations

### Frontend Services
- `client/src/services/appwrite-client.js` - Browser SDK wrapper
- `client/src/services/user-service.js` - User operations (getProfile, updateProfile, getEcoPoints)
- `client/src/services/challenge-service.js` - Challenge operations (getActiveChallenges, submitChallenge)

### Configuration
- `server/.env` - Updated with 5 Appwrite variables (ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, WEBHOOK_KEY)
- `server/package.json` - Added node-appwrite ^14.1.0 and 3 Phase 3 npm scripts
- `.gitignore` - Updated to exclude MongoDB artifacts

---

## 6. Environment Variables Checklist

Run this to verify all required variables are set:

```bash
echo "APPWRITE_ENDPOINT=$APPWRITE_ENDPOINT"
echo "APPWRITE_PROJECT_ID=$APPWRITE_PROJECT_ID"
echo "APPWRITE_API_KEY=$APPWRITE_API_KEY"
echo "APPWRITE_DATABASE_ID=$APPWRITE_DATABASE_ID"
```

**Required before setup:**
- ✅ APPWRITE_ENDPOINT (already set: https://sgp.cloud.appwrite.io/v1)
- ✅ APPWRITE_PROJECT_ID (already set: 69b6ea3b0010c4b2e448)
- ⚠️ **APPWRITE_API_KEY** (needs to be added - see Section 1)
- ✅ APPWRITE_DATABASE_ID (already set: ecokids_main)
- ⚠️ APPWRITE_WEBHOOK_KEY (optional, for webhooks later)

---

## 7. npm Scripts Added

```bash
npm run phase3:setup          # Execute Phase 3.1 setup
npm run phase3:add-attrs      # Execute Phase 3.2a attribute addition
npm run phase3:seed           # Execute Phase 3.2b data seeding
npm run test-appwrite         # Test connection (in package.json)
```

---

## 8. Troubleshooting

### "401 Invalid API Key"
- Verify APPWRITE_API_KEY in server/.env is correct
- Check that API key has proper scopes in Appwrite console
- Confirm you're using the **secret** (not the public key)

### "Project not found"
- Verify APPWRITE_PROJECT_ID matches Appwrite console
- Ensure you're logged into correct Appwrite project

### "Database already exists"
- This is expected! Run with `--force` flag (not yet implemented, safe to ignore)
- Collections/attributes will be skipped if they exist (409 conflict = OK)

### Modules not initializing
- Ensure node-appwrite ^14.1.0 is installed: `npm ls node-appwrite`
- Clear node_modules and reinstall if needed: `rm -rf node_modules && npm install`

### Database operations failing
- Check collection exists: Visit Appwrite console → Database → Collections
- Verify attributes are created: Check collection → Attributes tab
- Test with simple curl: Can you reach Appwrite endpoint from this machine?

---

## 9. Next Steps After Phase 3.2

1. **Phase 3.3**: Create cloud functions (scheduled jobs, webhooks)
2. **Phase 3.4**: Implement file upload pipelines (storage buckets)
3. **Phase 3.5**: Set up async message queue (SMS/email notifications)
4. **Phase 3.6**: Migrate MongoDB data to Appwrite (bulk import)
5. **Phase 4**: Integration testing & end-to-end verification

---

## 10. References

- [Appwrite Console](https://sgp.cloud.appwrite.io)
- [Appwrite Server SDK Docs](https://appwrite.io/docs/sdks#server)
- [Appwrite Database/Collections](https://appwrite.io/docs/databases)
- [node-appwrite npm](https://www.npmjs.com/package/node-appwrite)

---

**Maintenance Note**: If you need to clean up and restart:
```bash
# Delete Appwrite database (only if needed)
# Done via console UI: Database → Delete

# Clear test data
npm run phase3:seed -- --clean

# Re-run full setup
npm run phase3:setup && npm run phase3:add-attrs && npm run phase3:seed
```
