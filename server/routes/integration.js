const express = require('express');
const { integrateAuth } = require('../middleware/integrationAuth');
const {
    getStateImpactSummary,
    getDistrictImpactSummary,
    getSchoolImpactSummary,
    getVerifiedActivities,
    exportImpactCSV
} = require('../controllers/integrationController');

const router = express.Router();

// Apply the Machine-to-Machine external API Key interceptor on all endpoints
router.use(integrateAuth);

/**
 * @route   GET /api/integration/*
 * @desc    Automated outputs targeted for Government + NGO scraping bodies
 */
router.route('/state-summary').get(getStateImpactSummary);
router.route('/district-summary').get(getDistrictImpactSummary);
router.route('/school-summary').get(getSchoolImpactSummary);

router.route('/verified-activities').get(getVerifiedActivities);

router.route('/export/csv').get(exportImpactCSV);

module.exports = router;
