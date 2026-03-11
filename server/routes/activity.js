const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const pagination = require('../middleware/pagination');
const {
  submitActivity,
  getMySubmissions,
  getPendingSubmissions,
  verifyActivity,
  syncOfflineSubmissions
} = require('../controllers/activityController');
const { upload, validateMagicBytes } = require('../middleware/upload');
const optimizeImage = require('../middleware/optimizeImage');
const { submissionLimiter } = require('../middleware/rateLimiter');
const { requireIdempotencyKey } = require('../middleware/idempotency');
const { moderateTextFields } = require('../middleware/contentModeration');


const router = express.Router();

router.post('/submit', protect, submissionLimiter, requireIdempotencyKey, moderateTextFields(['description']), upload.single('image'), validateMagicBytes, optimizeImage, submitActivity);
router.get('/my', protect, pagination, getMySubmissions);
router.get('/pending', protect, authorize('teacher', 'admin', 'school_admin'), pagination, getPendingSubmissions);
router.put('/:submissionId/verify', protect, authorize('teacher', 'admin', 'school_admin'), verifyActivity);
router.post('/sync-offline', protect, moderateTextFields(['description']), syncOfflineSubmissions);

module.exports = router;
