const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const storeController = require('../controllers/storeController');

const router = express.Router();

const redeemValidation = [
  body('storeItemId').isMongoId().withMessage('Valid storeItemId is required'),
  body('quantity').optional().isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note must be at most 300 characters')
];

const statusValidation = [
  param('id').isMongoId().withMessage('Valid redemption id is required'),
  body('status')
    .isIn(['pending', 'approved', 'fulfilled', 'rejected', 'refunded'])
    .withMessage('Invalid status value'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note must be at most 300 characters')
];

router.get(
  '/items',
  protect,
  requireRole(ROLES.STUDENT, ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN, ROLES.NGO_COORDINATOR, 'admin'),
  storeController.listItems
);

router.post(
  '/redeem',
  protect,
  requireRole(ROLES.STUDENT, ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN, ROLES.NGO_COORDINATOR, 'admin'),
  redeemValidation,
  storeController.redeemItem
);

router.get(
  '/redemptions/me',
  protect,
  requireRole(ROLES.STUDENT, ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN, ROLES.NGO_COORDINATOR, 'admin'),
  storeController.myRedemptions
);

router.patch(
  '/redemptions/:id/status',
  protect,
  authorize('admin', 'state_admin', 'district_admin', 'school_admin'),
  statusValidation,
  storeController.updateRedemptionStatus
);

module.exports = router;
