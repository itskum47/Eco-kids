const express = require('express');
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

/**
 * Parent Consent Bulk Collection Routes
 * Phase 6: School Rollout Infrastructure
 */

// Send parent consent requests in bulk
// POST /api/v1/consent/bulk-send-parent
// Auth: SCHOOL_ADMIN
// Body: { studentIds: [...] } OR { grade: '8', section: 'A' }
router.post(
  '/bulk-send-parent',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN),
  bulkSendParentConsent
);

// Get consent status for entire school
// GET /api/v1/consent/parent-status/:schoolId
// Auth: SCHOOL_ADMIN, DISTRICT_ADMIN, STATE_ADMIN
router.get(
  '/parent-status/:schoolId',
  protect,
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  getParentConsentStatus
);

// Send reminder to non-consented parents
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
