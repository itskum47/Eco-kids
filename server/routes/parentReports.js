const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const parentReportController = require('../controllers/parentReportController');

// Protected routes - all require authentication
router.use(protect);

// Parent routes (parents viewing their children's progress)
router.post('/generate', authorize('parent', 'teacher', 'school_admin'), parentReportController.generateParentReport);
router.get('/my-reports', authorize('parent'), parentReportController.getMyReports);
router.get('/:reportId', authorize('parent'), parentReportController.getReportById);
router.post('/:reportId/acknowledge', authorize('parent'), parentReportController.acknowledgeReport);
router.get('/:studentId/summary', authorize('parent'), parentReportController.getStudentProgressSummary);
router.get('/:reportId/download-pdf', authorize('parent'), parentReportController.downloadReportPDF);

// Analytics
router.get('/analytics/summary', authorize('parent'), parentReportController.getReportAnalytics);

// Admin routes (view all reports in school/district)
router.get('/admin/all-reports', authorize('school_admin', 'district_admin', 'state_admin'), parentReportController.getAllParentReports);

module.exports = router;
