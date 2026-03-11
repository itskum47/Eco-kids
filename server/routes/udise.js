const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');
const {
  verifyUdiseCode,
  linkUdiseToSchool,
  getUdiseStatus
} = require('../controllers/udiseController');

const router = express.Router();

router.use(protect);

router.get(
  '/verify/:udiseCode',
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    param('udiseCode')
      .matches(/^\d{11}$/)
      .withMessage('UDISE code must be exactly 11 digits')
  ],
  handleValidationErrors,
  verifyUdiseCode
);

router.post(
  '/link',
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    body('udiseCode')
      .matches(/^\d{11}$/)
      .withMessage('UDISE code must be exactly 11 digits'),
    body('schoolId')
      .optional()
      .isMongoId()
      .withMessage('schoolId must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  linkUdiseToSchool
);

router.get(
  '/status/:schoolId?',
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  [
    param('schoolId')
      .optional()
      .isMongoId()
      .withMessage('schoolId must be a valid MongoDB ObjectId')
  ],
  handleValidationErrors,
  getUdiseStatus
);

module.exports = router;
