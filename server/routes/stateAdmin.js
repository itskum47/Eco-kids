const express = require('express');
const { requireRole } = require('../middleware/requireRole');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { getDashboard, getDistricts, getImpactMetrics } = require('../controllers/stateAdminController');
const { ROLES } = require('../constants/roles');

router.use(protect);
router.use(requireRole(ROLES.STATE_ADMIN, ROLES.ADMIN));

router.get('/dashboard', getDashboard);
router.get('/districts', getDistricts);
router.get('/impact', getImpactMetrics);

module.exports = router;
