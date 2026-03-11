const express = require('express');
const { body, query, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createSafetyReport,
  listSafetyReports,
  resolveSafetyReport
} = require('../controllers/safetyController');
const {
  flagSubmissionForSafety,
  getSafetyDashboard,
  reviewSafetyFlag,
  getSafetyAuditLog
} = require('../controllers/safetyEscalationController');

const router = express.Router();

router.use(protect);

router.post(
  '/report',
  [
    body('subjectType')
      .isIn(['feed_post', 'feed_comment', 'activity_submission', 'user_profile', 'other'])
      .withMessage('Invalid subjectType'),
    body('subjectId').trim().isLength({ min: 1, max: 120 }).withMessage('subjectId is required'),
    body('reason').isIn(['harassment', 'sexual_content', 'bullying', 'self_harm', 'abuse', 'other']).withMessage('Invalid reason'),
    body('details').optional().trim().isLength({ max: 1000 }).withMessage('details must be <= 1000 chars'),
    body('riskScore').optional().isInt({ min: 1, max: 10 }).withMessage('riskScore must be between 1 and 10')
  ],
  handleValidationErrors,
  createSafetyReport
);

router.get(
  '/reports',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    query('status').optional().isIn(['open', 'in_review', 'resolved', 'rejected', 'all']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100')
  ],
  handleValidationErrors,
  listSafetyReports
);

router.patch(
  '/reports/:id',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
    body('status').isIn(['in_review', 'resolved', 'rejected']).withMessage('Invalid status transition'),
    body('moderationNotes').optional().trim().isLength({ max: 1000 }).withMessage('moderationNotes must be <= 1000 chars')
  ],
  handleValidationErrors,
  resolveSafetyReport
);

// Phase 6: BOOST-5 POCSO Safety - Auto-escalation & Admin Dashboard
router.post('/flag-submission', requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN), flagSubmissionForSafety);
router.get('/dashboard', requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getSafetyDashboard);
router.post('/review-flag', requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), reviewSafetyFlag);
router.get('/audit-log', requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN, ROLES.ADMIN), getSafetyAuditLog);

module.exports = router;
