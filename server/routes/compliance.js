const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');
const {
    getDataProcessingNotices,
    recordConsent,
    revokeConsent,
    getConsentStatus,
    exportUserData,
    deleteAccountDPDP,
    logoutAllSessions,
    getActiveSessions,
    getDataLocalizationStatus
} = require('../controllers/complianceController');
const {
    getPolicyVersion,
    acceptUpdatedPolicy,
    getStudentsNeedingReconsent,
    getPolicyChanges,
    getComplianceAuditLog
} = require('../controllers/dpdpComplianceController');
const {
    generateNEPCertificate,
    getNEPCompetencyReport
} = require('../controllers/nepCertificateController');
const {
    getSDGImpactReport,
    getSDGDashboard
} = require('../controllers/sdgImpactController');
const {
    verifyDataResidency,
    getDataMigrationScript
} = require('../controllers/dataResidencyController');

// Public
router.get('/notices', getDataProcessingNotices);

// Protected — all require authenticated user
router.use(protect);

// Consent management
router.post('/consent', recordConsent);
router.post('/consent/revoke', revokeConsent);
router.get('/consent/status', getConsentStatus);

// Data rights (DPDP Act 2023)
router.get('/data-export', exportUserData);
router.delete('/account', deleteAccountDPDP);
router.get(
    '/data-localization-status',
    requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
    [
        query('verbose').optional().isBoolean().withMessage('verbose must be true or false')
    ],
    handleValidationErrors,
    getDataLocalizationStatus
);

// Session management
router.post('/logout-all', logoutAllSessions);
router.get('/sessions', getActiveSessions);

// Phase 6: BOOST-1 DPDP 2023 - Policy Versioning & Consent Tracking
router.get('/policy-version/:studentId?', getPolicyVersion);
router.post('/accept-policy', acceptUpdatedPolicy);
router.get('/policy-changes', getPolicyChanges);
router.get('/students-needing-reconsent', authorize('school_admin', 'teacher'), getStudentsNeedingReconsent);
router.get('/audit-log', authorize('school_admin', 'admin'), getComplianceAuditLog);

// Phase 6: BOOST-2 NEP 2020 - Competency Certificates
router.get('/nep-certificate/:studentId', authorize('school_admin', 'teacher', 'student'), generateNEPCertificate);
router.get('/nep-report', authorize('school_admin', 'teacher'), getNEPCompetencyReport);

// Phase 6: BOOST-3 SDG Coverage - UN 2030 Impact Reporting
router.get('/sdg-impact-report', authorize('school_admin', 'teacher', 'district_admin', 'state_admin'), getSDGImpactReport);
router.get('/sdg-dashboard', authorize('school_admin', 'teacher'), getSDGDashboard);

// Phase 6: BOOST-6 Data Residency - India IT Act 2000 Compliance
router.get('/data-residency-verification', authorize('school_admin', 'district_admin', 'state_admin', 'admin'), verifyDataResidency);
router.get('/data-migration-script', authorize('admin'), getDataMigrationScript);

module.exports = router;
