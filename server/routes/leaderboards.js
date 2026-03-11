const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/v1/leaderboards/global
// Returns global eco-points leaderboard (all students)
router.get('/global', async (req, res) => {
  try {
    const User = require('../models/User');
    const leaderboard = await User.find({ role: 'student' })
      .select('firstName lastName email ecoPoints level currentStreak schoolId')
      .sort({ ecoPoints: -1 })
      .limit(100)
      .populate('schoolId', 'schoolName');

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        ecoPoints: user.ecoPoints,
        level: user.level,
        streak: user.currentStreak,
        school: user.schoolId?.schoolName || 'Unknown',
      })),
    });
  } catch (error) {
    logger.error('Error fetching global leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/v1/leaderboards/school/:schoolId
// Returns school-specific leaderboard
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const User = require('../models/User');

    const leaderboard = await User.find({ schoolId, role: 'student' })
      .select('firstName lastName email ecoPoints level currentStreak')
      .sort({ ecoPoints: -1 })
      .limit(50);

    res.json({
      success: true,
      schoolId,
      count: leaderboard.length,
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        name: `${user.firstName} ${user.lastName}`,
        ecoPoints: user.ecoPoints,
        level: user.level,
        streak: user.currentStreak,
      })),
    });
  } catch (error) {
    logger.error('Error fetching school leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/v1/leaderboards/district/:districtId
// Returns district-wide leaderboard
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const School = require('../models/School');
    const User = require('../models/User');

    // Get all schools in district
    const schools = await School.find({ districtId });
    const schoolIds = schools.map(s => s._id);

    const leaderboard = await User.find({ schoolId: { $in: schoolIds }, role: 'student' })
      .select('firstName lastName email ecoPoints level currentStreak schoolId')
      .sort({ ecoPoints: -1 })
      .limit(100)
      .populate('schoolId', 'schoolName');

    res.json({
      success: true,
      districtId,
      count: leaderboard.length,
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        name: `${user.firstName} ${user.lastName}`,
        ecoPoints: user.ecoPoints,
        school: user.schoolId?.schoolName || 'Unknown',
      })),
    });
  } catch (error) {
    logger.error('Error fetching district leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/v1/leaderboards/my-rank
// Returns authenticated user's rank
router.get('/my-rank', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');

    const user = await User.findById(userId).select('firstName lastName ecoPoints');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const globalRank = await User.countDocuments({
      role: 'student',
      ecoPoints: { $gt: user.ecoPoints },
    });

    const schoolRank = await User.countDocuments({
      schoolId: req.user.schoolId,
      role: 'student',
      ecoPoints: { $gt: user.ecoPoints },
    });

    res.json({
      success: true,
      name: `${user.firstName} ${user.lastName}`,
      ecoPoints: user.ecoPoints,
      globalRank: globalRank + 1,
      schoolRank: schoolRank + 1,
    });
  } catch (error) {
    logger.error('Error fetching user rank', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

module.exports = router;
