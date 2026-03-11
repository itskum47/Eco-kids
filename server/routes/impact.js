const express = require('express');
const router = express.Router();
const {
  getMyImpact,
  getGlobalImpact,
  getSchoolImpact,
  getImpactLeaderboard,
  getDistrictImpact,
  getUserImpactHistory,
  getImpactStats
} = require('../controllers/impactController');
const { protect } = require('../middleware/auth');

/**
 * @desc    Get current user's environmental impact
 * @route   GET /api/impact/me
 * @access  Private
 */
router.get('/me', protect, getMyImpact);

/**
 * @desc    Get user impact history for charts
 * @route   GET /api/impact/me/history
 * @access  Private
 */
router.get('/me/history', protect, getUserImpactHistory);

/**
 * @desc    Get global environmental statistics
 * @route   GET /api/impact/global
 * @access  Public
 */
router.get('/global', getGlobalImpact);
router.get('/stats', getImpactStats);

/**
 * @desc    Get impact leaderboard by metric
 * @route   GET /api/impact/leaderboard
 * @access  Public
 */
router.get('/leaderboard', getImpactLeaderboard);

/**
 * @desc    Get school-level impact
 * @route   GET /api/impact/school/:schoolName
 * @access  Public
 */
router.get('/school/:schoolName', getSchoolImpact);

/**
 * @desc    Get district impact statistics and school rankings
 * @route   GET /api/impact/district/:districtName
 * @access  Public
 */
router.get('/district/:districtName', getDistrictImpact);

module.exports = router;
