const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { handleValidationErrors } = require('../middleware/validation');
const { reportIncident, getReadinessStatus } = require('../controllers/certInController');

const router = express.Router();

router.use(protect);
router.use(requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN));

router.get('/readiness', getReadinessStatus);

router.post(
  '/incidents',
  [
    body('incidentType').trim().isLength({ min: 3, max: 80 }).withMessage('incidentType is required'),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('severity must be low/medium/high/critical'),
    body('summary').trim().isLength({ min: 10, max: 1000 }).withMessage('summary must be 10-1000 chars'),
    body('evidence').optional().isObject().withMessage('evidence must be an object')
  ],
  handleValidationErrors,
  reportIncident
);

module.exports = router;
