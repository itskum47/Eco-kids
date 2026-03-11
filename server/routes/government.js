/**
 * @fileoverview Government Integration Routes
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  generateMonthlyReport,
  submitReport,
  getComplianceDashboard,
  getNEP2020Alignment,
  exportReport,
  getGovernmentDashboardSummary
} = require('../controllers/governmentController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');

// All government routes require state admin authentication
router.use(protect);
router.use(requireRole(ROLES.STATE_ADMIN, ROLES.DISTRICT_ADMIN));

// Report generation and submission
router.post(
  '/reports/generate',
  [
    body('state').trim().isLength({ min: 2, max: 80 }).withMessage('state is required'),
    body('district').optional().trim().isLength({ min: 2, max: 80 }).withMessage('district must be 2-80 chars'),
    body('reportingPeriod.startDate').isISO8601().withMessage('reportingPeriod.startDate must be a valid ISO date'),
    body('reportingPeriod.endDate').isISO8601().withMessage('reportingPeriod.endDate must be a valid ISO date')
  ],
  handleValidationErrors,
  generateMonthlyReport
);
router.post(
  '/reports/:id/submit',
  [param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId')],
  handleValidationErrors,
  submitReport
);

// Compliance dashboards
router.get(
  '/compliance-dashboard',
  [query('state').optional().trim().isLength({ min: 2, max: 80 }).withMessage('state must be 2-80 chars')],
  handleValidationErrors,
  getComplianceDashboard
);
router.get(
  '/nep-2020-alignment',
  [query('state').optional().trim().isLength({ min: 2, max: 80 }).withMessage('state must be 2-80 chars')],
  handleValidationErrors,
  getNEP2020Alignment
);
router.get(
  '/dashboard/summary',
  [
    query('state').optional().trim().isLength({ min: 2, max: 80 }).withMessage('state must be 2-80 chars'),
    query('district').optional().trim().isLength({ min: 2, max: 80 }).withMessage('district must be 2-80 chars')
  ],
  handleValidationErrors,
  getGovernmentDashboardSummary
);

// Export functionality
router.get(
  '/reports/:id/export',
  [
    param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
    query('format').optional().isIn(['pdf', 'excel']).withMessage('format must be pdf or excel')
  ],
  handleValidationErrors,
  exportReport
);

module.exports = router;
