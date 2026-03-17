const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { requireConsent } = require('../middleware/requireConsent');
const logger = require('../utils/logger');

const LEADERBOARD_SALT = process.env.LEADERBOARD_ID_SALT || 'ecokids-lb-salt';

/**
 * Anonymize a student entry for public leaderboards:
 * - name becomes "FirstName L." (first name + last initial)
 * - email is removed
 * - _id is replaced with a deterministic SHA-256 hash
 */
function anonymizeEntry(user, rank) {
  const fullName = user.name || '';
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || 'Student';
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : '';
  const displayName = lastInitial ? `${firstName} ${lastInitial}` : firstName;

  const hashedId = crypto
    .createHash('sha256')
    .update(String(user._id) + LEADERBOARD_SALT)
    .digest('hex')
    .slice(0, 16);

  return {
    rank,
    id: hashedId,
    name: displayName,
    ecoPoints: user.gamification?.ecoPoints || 0,
    level: user.gamification?.level || 1,
    streak: user.gamification?.streak?.current || 0,
  };
}

// GET /api/v1/leaderboards/global
// Returns global eco-points leaderboard (all students, anonymized)
router.get('/global', async (req, res) => {
  try {
    const User = require('../models/User');
    const School = require('../models/School');

    const eligibleSchools = await School.find({ public_leaderboard_enabled: true }).select('_id').lean();
    const eligibleSchoolIds = eligibleSchools.map((school) => school._id);

    const leaderboard = await User.find({
      role: 'student',
      $or: [
        { 'profile.schoolId': { $in: eligibleSchoolIds } },
        { schoolId: { $in: eligibleSchoolIds } }
      ]
    })
      .select('name gamification.ecoPoints gamification.level gamification.streak schoolId profile.schoolId')
      .sort({ 'gamification.ecoPoints': -1 })
      .limit(100)
      .populate('schoolId', 'name')
      .lean();

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard: leaderboard.map((user, index) => ({
        ...anonymizeEntry(user, index + 1),
        school: user.schoolId?.name || 'Unknown',
      })),
    });
  } catch (error) {
    logger.error('Error fetching global leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/v1/leaderboards/school/:schoolId
// Returns school-specific leaderboard (anonymized for privacy consistency)
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const User = require('../models/User');

    const leaderboard = await User.find({
      role: 'student',
      $or: [{ 'profile.schoolId': schoolId }, { schoolId }]
    })
      .select('name gamification.ecoPoints gamification.level gamification.streak')
      .sort({ 'gamification.ecoPoints': -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      schoolId,
      count: leaderboard.length,
      leaderboard: leaderboard.map((user, index) => anonymizeEntry(user, index + 1)),
    });
  } catch (error) {
    logger.error('Error fetching school leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/v1/leaderboards/district/:districtId
// Returns district-wide leaderboard (anonymized)
router.get('/district/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const School = require('../models/School');
    const User = require('../models/User');

    const schools = await School.find({
      public_leaderboard_enabled: true,
      $or: [{ districtId }, { district: districtId }]
    }).select('_id name').lean();
    const schoolIds = schools.map(s => s._id);

    const leaderboard = await User.find({
      role: 'student',
      $or: [
        { 'profile.schoolId': { $in: schoolIds } },
        { schoolId: { $in: schoolIds } }
      ]
    })
      .select('name gamification.ecoPoints gamification.level gamification.streak schoolId profile.schoolId')
      .sort({ 'gamification.ecoPoints': -1 })
      .limit(100)
      .populate('schoolId', 'name')
      .lean();

    res.json({
      success: true,
      districtId,
      count: leaderboard.length,
      leaderboard: leaderboard.map((user, index) => ({
        ...anonymizeEntry(user, index + 1),
        school: user.schoolId?.name || 'Unknown',
      })),
    });
  } catch (error) {
    logger.error('Error fetching district leaderboard', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/v1/leaderboards/my-rank
// Returns authenticated user's own rank (full name for self)
router.get('/my-rank', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');

    const user = await User.findById(userId).select('name gamification.ecoPoints gamification.level').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ecoPoints = user.gamification?.ecoPoints || 0;

    const [globalRank, schoolRank] = await Promise.all([
      User.countDocuments({ role: 'student', 'gamification.ecoPoints': { $gt: ecoPoints } }),
      User.countDocuments({
        $or: [
          { 'profile.schoolId': req.user.profile?.schoolId },
          { schoolId: req.user.schoolId }
        ],
        role: 'student',
        'gamification.ecoPoints': { $gt: ecoPoints }
      })
    ]);

    res.json({
      success: true,
      name: user.name,
      ecoPoints,
      globalRank: globalRank + 1,
      schoolRank: schoolRank + 1,
    });
  } catch (error) {
    logger.error('Error fetching user rank', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

module.exports = router;
