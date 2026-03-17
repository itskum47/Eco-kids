const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const pagination = require('../middleware/pagination');
const {
  submitActivity,
  getMySubmissions,
  getPendingSubmissions,
  verifyActivity,
  syncOfflineSubmissions,
  appealSubmission,
  resolveAppeal,
  getAppealedSubmissions
} = require('../controllers/activityController');
const { upload, validateMagicBytes } = require('../middleware/upload');
const optimizeImage = require('../middleware/optimizeImage');
const { submissionLimiter } = require('../middleware/rateLimiter');
const { requireIdempotencyKey } = require('../middleware/idempotency');
const { moderateTextFields } = require('../middleware/contentModeration');
const { requireConsent } = require('../middleware/requireConsent');

const router = express.Router();

// Enforce parental consent for all activity routes (DPDP Act 2023)
router.use(protect, requireConsent);

router.post('/submit', protect, submissionLimiter, requireIdempotencyKey, moderateTextFields(['description']), upload.single('image'), validateMagicBytes, optimizeImage, submitActivity);
router.get('/my', protect, pagination, getMySubmissions);
router.get('/pending', protect, authorize('teacher', 'admin', 'school_admin'), pagination, getPendingSubmissions);
router.get('/appeals/pending', protect, authorize('teacher', 'admin', 'school_admin'), getAppealedSubmissions);
router.post('/:submissionId/appeal', protect, moderateTextFields(['reason']), appealSubmission);
router.put('/:submissionId/appeal/resolve', protect, authorize('teacher', 'admin', 'school_admin'), moderateTextFields(['teacherNote']), resolveAppeal);
router.put('/:submissionId/verify', protect, authorize('teacher', 'admin', 'school_admin'), verifyActivity);
router.post('/sync-offline', protect, moderateTextFields(['description']), syncOfflineSubmissions);

module.exports = router;
