const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const {
    getEngagementFunnel,
    exportReport,
    trackEvent,
    getNGOImpactSummary,
    getMetricsSummary
} = require('../controllers/reportingController');

router.use(protect);

// User tracking
router.post('/track', trackEvent);

// Admin reporting
router.get('/funnel', authorize('admin', 'district_admin', 'state_admin'), getEngagementFunnel);
router.get('/export', authorize('admin', 'district_admin', 'state_admin'), exportReport);
router.get('/metrics-summary', authorize('admin', 'district_admin', 'state_admin'), getMetricsSummary);

// NGO reporting (NGO Coordinators only)
router.get('/ngo/impact-summary', requireRole(ROLES.NGO_COORDINATOR), getNGOImpactSummary);

module.exports = router;
