const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { getDailyChallenge, completeDailyChallenge } = require('../controllers/dailyChallengeController');
const {
  getAllChallenges,
  getChallengeById,
  getActiveChallenges,
  getSchoolChallenges,
  createChallenge,
  updateChallengeStatus,
  updateChallengeScores,
  finalizeChallenge,
  deleteChallenge
} = require('../controllers/challengeController');

const router = express.Router();

// Public routes
router.get('/school-challenges', getAllChallenges);
router.get('/school-challenges/active', getActiveChallenges);
router.get('/school-challenges/:id', getChallengeById);

// Protected routes
router.use(protect);

// Daily challenges (existing)
router.get('/daily', getDailyChallenge);
router.post('/daily/complete', completeDailyChallenge);

// School challenges - student routes
router.get('/school-challenges/school/:schoolId', getSchoolChallenges);

// School challenges - teacher/admin routes
router.post(
  '/school-challenges',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  createChallenge
);
router.patch(
  '/school-challenges/:id/status',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  updateChallengeStatus
);
router.post(
  '/school-challenges/:id/update-scores',
  requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  updateChallengeScores
);
router.post(
  '/school-challenges/:id/finalize',
  requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  finalizeChallenge
);
router.delete(
  '/school-challenges/:id',
  requireRole(ROLES.STATE_ADMIN),
  deleteChallenge
);

module.exports = router;
