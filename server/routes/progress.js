const express = require('express');
const {
  getMyProgress,
  updateTopicProgress,
  updateExperimentProgress,
  updateGameProgress,
  recordQuizAttempt,
  getLearningAnalytics
} = require('../controllers/progress');

const { protect } = require('../middleware/auth');
const { requireConsent } = require('../middleware/requireConsent');

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(requireConsent);

// User progress routes
router.get('/me', getMyProgress);
router.put('/topic/:topicId', updateTopicProgress);
router.put('/experiment/:experimentId', updateExperimentProgress);
router.put('/game/:gameId', updateGameProgress);
router.post('/quiz/:quizId', recordQuizAttempt);
router.get('/analytics', getLearningAnalytics);

module.exports = router;