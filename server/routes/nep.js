const express = require('express');
const { param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');
const {
  getMyNepProgress,
  getSchoolNepReport,
  generateNepCertificate
} = require('../controllers/nepReportController');

const router = express.Router();

router.use(protect);

router.get(
  '/my-progress',
  requireRole(
    ROLES.STUDENT,
    ROLES.TEACHER,
    ROLES.SCHOOL_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.STATE_ADMIN,
    ROLES.NGO_COORDINATOR
  ),
  getMyNepProgress
);

router.get(
  '/school-report/:schoolId?',
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    param('schoolId')
      .optional()
      .isMongoId()
      .withMessage('schoolId must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  getSchoolNepReport
);

router.get(
  '/certificate/:studentId',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    param('studentId')
      .isMongoId()
      .withMessage('studentId must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  generateNepCertificate
);

module.exports = router;
