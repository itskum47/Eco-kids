const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  scheduleAccountDeletion,
  cancelAccountDeletion,
  exportMyData
} = require('../controllers/privacyController');

// DPDP Act 2023 - Right to Erasure & Data Portability
// All routes require authentication

// @route   POST /api/v1/privacy/delete-account
// @desc    Schedule account deletion (30-day grace period)
// @access  Private
router.post('/delete-account', protect, scheduleAccountDeletion);

// @route   POST /api/v1/privacy/cancel-deletion
// @desc    Cancel scheduled account deletion (within 30-day window)
// @access  Private
router.post('/cancel-deletion', protect, cancelAccountDeletion);

// @route   GET /api/v1/privacy/export-my-data
// @desc    Export all personal data (right to data portability)
// @access  Private
router.get('/export-my-data', protect, exportMyData);

module.exports = router;
