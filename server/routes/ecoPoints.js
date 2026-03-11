const express = require('express');
const {
  getEcoPointsSummary,
  getUserTransactions,
  getLeaderboard,
  getSchoolLeaderboard,
  getUserRanking,
  getEcoPointsStats,
  getTopPerformers
} = require('../controllers/ecoPointsController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/stats', getEcoPointsStats);
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/school/:schoolName', getSchoolLeaderboard);
router.get('/top-performers', getTopPerformers);

// Protected routes
router.get('/summary', protect, getEcoPointsSummary);
router.get('/transactions', protect, getUserTransactions);
router.get('/ranking', protect, getUserRanking);

module.exports = router;
