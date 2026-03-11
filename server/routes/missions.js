const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const StudentWeeklyMission = require('../models/StudentWeeklyMission');
const logger = require('../utils/logger');

// All mission routes require authentication
router.use(protect);

// Student routes
router.get('/current', missionController.getCurrentMissions);
router.get('/weekly/current', async (req, res) => {
  try {
    const now = new Date();
    const missions = await StudentWeeklyMission.findOne({
      user: req.user._id,
      expiresAt: { $gte: now }
    })
      .select('missions allCompleted completedCount totalReward expiresAt')
      .lean();

    if (!missions) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active weekly missions'
      });
    }

    res.status(200).json({
      success: true,
      data: missions
    });
  } catch (err) {
    logger.error('[MissionsRoute] Error fetching weekly missions:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly missions',
      error: err.message
    });
  }
});

router.get('/:id/progress', missionController.getMissionProgress);
router.post('/:id/claim', missionController.claimMissionReward);

// Admin routes
router.get('/all', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), missionController.getAllMissions);

module.exports = router;
