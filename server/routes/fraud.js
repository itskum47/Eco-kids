const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getFraudFlags,
    getFraudSummary,
    resolveFraudFlag
} = require('../controllers/fraudController');

// All routes require admin
router.use(protect);
router.use(authorize('admin', 'school_admin'));

router.get('/flags', getFraudFlags);
router.get('/summary', getFraudSummary);
router.patch('/flags/:id/resolve', resolveFraudFlag);

module.exports = router;
