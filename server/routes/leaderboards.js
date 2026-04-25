const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { requireConsent } = require('../middleware/requireConsent');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { getSnapshotHistory } = require('../services/leaderboardSnapshotService');
const {
  getGlobalLeaderboard,
  getSchoolLeaderboard,
  getDistrictLeaderboard,
  getUserRank,
} = require('../services/leaderboardService');

const hashLeaderboardEntries = (entries = []) =>
  crypto
    .createHash('sha256')
    .update(
      JSON.stringify(
        entries.map((entry) => ({
          rank: entry.rank,
          id: entry.id,
          ecoPoints: entry.ecoPoints,
          level: entry.level,
          streak: entry.streak,
        }))
      )
    )
    .digest('hex');

// GET /api/v1/leaderboards/global
// Returns global eco-points leaderboard (all students, anonymized)
router.get('/global', async (req, res) => {
  try {
    const leaderboard = await getGlobalLeaderboard({ limit: 100, anonymize: true });

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard,
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
    const leaderboard = await getSchoolLeaderboard({ schoolId, limit: 50, anonymize: true });

    res.json({
      success: true,
      schoolId,
      count: leaderboard.length,
      leaderboard,
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
    const leaderboard = await getDistrictLeaderboard({ districtId, limit: 100, anonymize: true });

    res.json({
      success: true,
      districtId,
      count: leaderboard.length,
      leaderboard,
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
    const rankData = await getUserRank({
      userId: req.user.id,
      schoolId: req.user.profile?.schoolId || req.user.schoolId,
    });

    if (!rankData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, ...rankData });
  } catch (error) {
    logger.error('Error fetching user rank', error);
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

// GET /api/v1/leaderboards/snapshots
// Returns deterministic leaderboard snapshot history for audits.
router.get('/snapshots', protect, authorize('teacher', 'school_admin', 'district_admin', 'state_admin', 'admin'), async (req, res) => {
  try {
    const { type, schoolId, districtId, limit = 20 } = req.query;
    const scope = {};

    if (schoolId) scope.schoolId = schoolId;
    if (districtId) scope.districtId = districtId;

    const snapshots = await getSnapshotHistory({
      boardType: type,
      scope,
      limit,
    });

    res.json({
      success: true,
      count: snapshots.length,
      data: snapshots,
    });
  } catch (error) {
    logger.error('Error fetching leaderboard snapshots', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard snapshots' });
  }
});

// GET /api/v1/leaderboards/validate-determinism
// Staff-only deterministic check: same input -> same ordered output hash.
router.get('/validate-determinism', protect, authorize('teacher', 'school_admin', 'district_admin', 'state_admin', 'admin'), async (req, res) => {
  try {
    const { type = 'global', schoolId, districtId } = req.query;
    let first = [];
    let second = [];

    if (type === 'school') {
      if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId is required for type=school' });
      first = await getSchoolLeaderboard({ schoolId, limit: 50, anonymize: true });
      second = await getSchoolLeaderboard({ schoolId, limit: 50, anonymize: true });
    } else if (type === 'district') {
      if (!districtId) return res.status(400).json({ success: false, message: 'districtId is required for type=district' });
      first = await getDistrictLeaderboard({ districtId, limit: 100, anonymize: true });
      second = await getDistrictLeaderboard({ districtId, limit: 100, anonymize: true });
    } else {
      first = await getGlobalLeaderboard({ limit: 100, anonymize: true });
      second = await getGlobalLeaderboard({ limit: 100, anonymize: true });
    }

    const firstHash = hashLeaderboardEntries(first);
    const secondHash = hashLeaderboardEntries(second);

    return res.json({
      success: true,
      type,
      deterministic: firstHash === secondHash,
      firstHash,
      secondHash,
      count: first.length,
    });
  } catch (error) {
    logger.error('Error validating leaderboard determinism', error);
    res.status(500).json({ success: false, message: 'Failed to validate leaderboard determinism' });
  }
});

module.exports = router;
