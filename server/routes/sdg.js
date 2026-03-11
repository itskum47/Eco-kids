const express = require('express');
const { query, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');
const {
  getSdgOverview,
  getStudentSdgProgress
} = require('../controllers/sdgController');

const router = express.Router();

router.use(protect);

router.get(
  '/overview',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    query('from').optional().isISO8601().withMessage('from must be a valid ISO date'),
    query('to').optional().isISO8601().withMessage('to must be a valid ISO date'),
    query('school').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('school must be 1-120 characters')
  ],
  handleValidationErrors,
  getSdgOverview
);

router.get(
  '/student/:studentId',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    param('studentId').isMongoId().withMessage('studentId must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  getStudentSdgProgress
);

module.exports = router;
