const express = require('express');
const {
  requestConsent,
  verifyConsent,
  getConsentStatus,
  revokeConsent,
  getAllConsents,
  giveConsent,
  getDPDPConsentStatus,
  withdrawConsent,
  verifyParentConsentToken
} = require('../controllers/consentController');
const {
  bulkSendParentConsent,
  getParentConsentStatus,
  sendConsentReminder,
  exportNonConsentedList
} = require('../controllers/parentConsentBulkController');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Public routes (Parental Consent)
router.post('/request', requestConsent);
router.post('/verify', verifyConsent);
router.post('/parent/verify', verifyParentConsentToken);
router.get('/status/:studentId', getConsentStatus);

// Protected routes (Parental Consent - district_admin and state_admin only)
router.post('/revoke/:studentId', protect, requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), revokeConsent);
router.get('/all', protect, requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getAllConsents);

// ============================================================================
// DPDP ACT 2023 CONSENT ROUTES
// ============================================================================

// Give consent for one or more consent types
router.post('/give', protect, giveConsent);

// Get DPDP consent status for logged-in user
router.get('/dpdp-status', protect, getDPDPConsentStatus);

// Withdraw consent for a specific type
router.post('/withdraw', protect, withdrawConsent);

// ============================================================================
// PHASE 6: BULK PARENT CONSENT COLLECTION (School Rollout)
// ============================================================================

// Send parent consent requests in bulk (to 500+ parents at once)
// POST /api/v1/consent/bulk-send-parent
// Auth: SCHOOL_ADMIN
router.post(
  '/bulk-send-parent',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN),
  bulkSendParentConsent
);

// Get parent consent status for entire school
// GET /api/v1/consent/parent-status/:schoolId
// Auth: SCHOOL_ADMIN, DISTRICT_ADMIN, STATE_ADMIN
router.get(
  '/parent-status/:schoolId',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  getParentConsentStatus
);

// Send reminders to parents who haven't consented yet
// POST /api/v1/consent/send-reminder/:schoolId
// Auth: SCHOOL_ADMIN
router.post(
  '/send-reminder/:schoolId',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN),
  sendConsentReminder
);

// Export non-consented students list as CSV
// GET /api/v1/consent/export-non-consented/:schoolId
// Auth: SCHOOL_ADMIN
router.get(
  '/export-non-consented/:schoolId',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN),
  exportNonConsentedList
);

module.exports = router;
