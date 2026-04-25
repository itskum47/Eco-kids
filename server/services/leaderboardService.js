const crypto = require('crypto');
const User = require('../models/User');
const School = require('../models/School');
const { extractScoreComponentsFromUser } = require('./scoringAuthorityService');
const { persistLeaderboardSnapshot } = require('./leaderboardSnapshotService');

const LEADERBOARD_SALT = process.env.LEADERBOARD_ID_SALT || 'ecokids-lb-salt';

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

  const { score } = extractScoreComponentsFromUser(user);

  return {
    rank,
    id: hashedId,
    name: displayName,
    ecoPoints: score,
    level: user.gamification?.level || 1,
    streak: user.gamification?.streak?.current || 0,
  };
}

async function getEligibleSchoolIds() {
  const schools = await School.find({ public_leaderboard_enabled: true }).select('_id').lean();
  return schools.map((school) => school._id);
}

async function getGlobalLeaderboard({ limit = 100, anonymize = true } = {}) {
  const eligibleSchoolIds = await getEligibleSchoolIds();

  const leaderboard = await User.find({
    role: 'student',
    $or: [
      { 'profile.schoolId': { $in: eligibleSchoolIds } },
      { schoolId: { $in: eligibleSchoolIds } }
    ]
  })
    .select('name gamification.ecoPoints gamification.level gamification.streak schoolId profile.schoolId')
    .sort({ 'gamification.ecoPoints': -1, createdAt: 1 })
    .limit(limit)
    .populate('schoolId', 'name')
    .lean();

  if (!anonymize) {
    return leaderboard.map((user, index) => {
      const scoreBreakdown = extractScoreComponentsFromUser(user);
      return {
        ...scoreBreakdown,
        rank: index + 1,
        _id: user._id,
        id: user._id,
        name: user.name,
        ecoPoints: scoreBreakdown.score,
        level: user.gamification?.level || 1,
        streak: user.gamification?.streak?.current || 0,
        school: user.schoolId?.name || 'Unknown',
      };
    });
  }

  const entries = leaderboard.map((user, index) => ({
    ...anonymizeEntry(user, index + 1),
    school: user.schoolId?.name || 'Unknown',
  }));

  await persistLeaderboardSnapshot({
    boardType: 'global',
    scope: {},
    entries,
    metadata: {
      source: 'leaderboardService.getGlobalLeaderboard',
      anonymized: anonymize,
    },
  }).catch(() => {});

  return entries;
}

async function getSchoolLeaderboard({ schoolId, limit = 50, anonymize = true } = {}) {
  const leaderboard = await User.find({
    role: 'student',
    $or: [{ 'profile.schoolId': schoolId }, { schoolId }]
  })
    .select('name gamification.ecoPoints gamification.level gamification.streak')
    .sort({ 'gamification.ecoPoints': -1, createdAt: 1 })
    .limit(limit)
    .lean();

  if (!anonymize) {
    return leaderboard.map((user, index) => {
      const scoreBreakdown = extractScoreComponentsFromUser(user);
      return {
        ...scoreBreakdown,
        rank: index + 1,
        _id: user._id,
        id: user._id,
        name: user.name,
        ecoPoints: scoreBreakdown.score,
        level: user.gamification?.level || 1,
        streak: user.gamification?.streak?.current || 0,
      };
    });
  }

  const entries = leaderboard.map((user, index) => anonymizeEntry(user, index + 1));

  await persistLeaderboardSnapshot({
    boardType: 'school',
    scope: { schoolId },
    entries,
    metadata: {
      source: 'leaderboardService.getSchoolLeaderboard',
      anonymized: anonymize,
    },
  }).catch(() => {});

  return entries;
}

async function getDistrictLeaderboard({ districtId, limit = 100, anonymize = true } = {}) {
  const schools = await School.find({
    public_leaderboard_enabled: true,
    $or: [{ districtId }, { district: districtId }]
  }).select('_id name').lean();
  const schoolIds = schools.map((s) => s._id);

  const leaderboard = await User.find({
    role: 'student',
    $or: [
      { 'profile.schoolId': { $in: schoolIds } },
      { schoolId: { $in: schoolIds } }
    ]
  })
    .select('name gamification.ecoPoints gamification.level gamification.streak schoolId profile.schoolId')
    .sort({ 'gamification.ecoPoints': -1, createdAt: 1 })
    .limit(limit)
    .populate('schoolId', 'name')
    .lean();

  if (!anonymize) {
    return leaderboard.map((user, index) => {
      const scoreBreakdown = extractScoreComponentsFromUser(user);
      return {
        ...scoreBreakdown,
        rank: index + 1,
        _id: user._id,
        id: user._id,
        name: user.name,
        ecoPoints: scoreBreakdown.score,
        level: user.gamification?.level || 1,
        streak: user.gamification?.streak?.current || 0,
        school: user.schoolId?.name || 'Unknown',
      };
    });
  }

  const entries = leaderboard.map((user, index) => ({
    ...anonymizeEntry(user, index + 1),
    school: user.schoolId?.name || 'Unknown',
  }));

  await persistLeaderboardSnapshot({
    boardType: 'district',
    scope: { districtId },
    entries,
    metadata: {
      source: 'leaderboardService.getDistrictLeaderboard',
      anonymized: anonymize,
    },
  }).catch(() => {});

  return entries;
}

async function getUserRank({ userId, schoolId }) {
  const user = await User.findById(userId).select('name gamification.ecoPoints gamification.level gamification.streak').lean();
  if (!user) {
    return null;
  }

  const scoreBreakdown = extractScoreComponentsFromUser(user);
  const ecoPoints = scoreBreakdown.score;

  const [globalRank, schoolRank] = await Promise.all([
    User.countDocuments({ role: 'student', 'gamification.ecoPoints': { $gt: ecoPoints } }),
    schoolId
      ? User.countDocuments({
        $or: [
          { 'profile.schoolId': schoolId },
          { schoolId }
        ],
        role: 'student',
        'gamification.ecoPoints': { $gt: ecoPoints }
      })
      : Promise.resolve(0)
  ]);

  return {
    name: user.name,
    ...scoreBreakdown,
    ecoPoints,
    level: user.gamification?.level || 1,
    streak: user.gamification?.streak?.current || 0,
    globalRank: globalRank + 1,
    schoolRank: schoolId ? schoolRank + 1 : null,
  };
}

module.exports = {
  getGlobalLeaderboard,
  getSchoolLeaderboard,
  getDistrictLeaderboard,
  getUserRank,
};
