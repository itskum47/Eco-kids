const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { governmentReport, grantApplication } = require('../controllers/governmentReportController');
const { exportSchoolReportCsv } = require('../controllers/reportingController');
const {
  generatePrincipalReportPDF,
  getPrincipalReportSummary,
  exportReportAsCSV
} = require('../controllers/principalReportController');

router.get('/government', protect, authorize('admin', 'state_admin', 'district_admin'), governmentReport);
router.get('/grant-application', protect, authorize('admin'), grantApplication);
router.get('/school/:schoolId/export', protect, authorize('admin', 'state_admin', 'district_admin', 'school_admin'), exportSchoolReportCsv);

// Phase 6: Principal Management Reports (School Admin Dashboard)
router.post('/principal/generate-pdf', protect, authorize('school_admin'), generatePrincipalReportPDF);
router.get('/principal/summary', protect, authorize('school_admin'), getPrincipalReportSummary);
router.get('/principal/export-csv', protect, authorize('school_admin'), exportReportAsCSV);

module.exports = router;
