const express = require('express');
const { requireRole } = require('../middleware/requireRole');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { getDashboard, getSchools, getImpactMetrics, getVeiAsm } = require('../controllers/districtAdminController');
const { ROLES } = require('../constants/roles');

router.use(protect);
router.use(requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN, ROLES.ADMIN));

router.get('/dashboard', getDashboard);
router.get('/schools', getSchools);
router.get('/impact', getImpactMetrics);
router.get('/vei-asm', getVeiAsm);

module.exports = router;
