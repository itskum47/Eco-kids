const EcoPointsTransaction = require('../models/EcoPointsTransaction');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const { extractScoreComponentsFromUser } = require('../services/scoringAuthorityService');
const { getUserRank } = require('../services/leaderboardService');

// @desc    Get user's eco-points summary
// @route   GET /api/eco-points/summary
// @access  Private
exports.getEcoPointsSummary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      totalEcoPoints: extractScoreComponentsFromUser(user).score,
      currentLevel: user.gamification.level,
      gamificationEcoPoints: extractScoreComponentsFromUser(user).score,
      badges: user.gamification.badges,
      streak: user.gamification.streak
    }
  });
});

// @desc    Get user's eco-points transactions
// @route   GET /api/eco-points/transactions
// @access  Private
exports.getUserTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sourceType, status } = req.query;

  const filter = { userId: req.user.id };

  if (sourceType) {
    filter.sourceType = sourceType;
  }

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const transactions = await EcoPointsTransaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EcoPointsTransaction.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

// @desc    Get leaderboard with scope and time filters
// @route   GET /api/eco-points/leaderboard
// @access  Public
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, scope = 'global', school, district, state, timeframe = 'all-time' } = req.query;

  // Build base query
  const query = { role: 'student', isActive: true };

  if (scope === 'school' && school) {
    query['profile.school'] = school;
  } else if (scope === 'district' && district) {
    query['profile.district'] = district;
    if (state) query['profile.state'] = state;
  }

  // Time-based filtering: for week/month, use RewardLedger aggregation
  if (timeframe === 'week' || timeframe === 'month') {
    const RewardLedger = require('../models/RewardLedger');
    const now = new Date();
    let startDate;

    if (timeframe === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    // Get users matching scope first
    const scopedUserIds = await User.find(query).select('_id').lean();
    const userIds = scopedUserIds.map(u => u._id);

    const epAgg = await RewardLedger.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          action: { $in: ['EP_CREDIT', 'MISSION_COMPLETE', 'STREAK_BONUS'] },
          reversedAt: null,
          processedAt: { $gte: startDate }
        }
      },
      { $group: { _id: '$userId', periodPoints: { $sum: '$amount' } } },
      { $sort: { periodPoints: -1 } },
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) }
    ]);

    // Enrich with user data
    const enrichedUserIds = epAgg.map(e => e._id);
    const users = await User.find({ _id: { $in: enrichedUserIds } })
      .select('name profile.school profile.grade gamification.level gamification.badges')
      .lean();

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const leaderboard = epAgg.map((entry, index) => {
      const u = userMap[entry._id.toString()];
      return {
        rank: parseInt(offset) + index + 1,
        name: u?.name || 'Unknown',
        school: u?.profile?.school || 'N/A',
        grade: u?.profile?.grade || 'N/A',
        ecoPoints: entry.periodPoints,
        badges: u?.gamification?.badges?.length || 0,
        level: u?.gamification?.level || 1
      };
    });

    return res.status(200).json({
      success: true,
      scope,
      timeframe,
      count: leaderboard.length,
      total: userIds.length,
      data: leaderboard
    });
  }

  // All-time leaderboard (original behavior, enhanced with scope)
  const users = await User.find(query)
    .select('name profile.school profile.grade gamification')
    .sort({ 'gamification.ecoPoints': -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  const leaderboard = users.map((user, index) => ({
    ...extractScoreComponentsFromUser(user),
    rank: parseInt(offset) + index + 1,
    name: user.name,
    school: user.profile?.school || 'N/A',
    grade: user.profile?.grade || 'N/A',
    ecoPoints: extractScoreComponentsFromUser(user).score,
    badges: user.gamification.badges.length,
    level: user.gamification.level
  }));

  res.status(200).json({
    success: true,
    scope,
    timeframe,
    count: leaderboard.length,
    total,
    data: leaderboard
  });
});

// @desc    Get school leaderboard
// @route   GET /api/eco-points/leaderboard/school/:schoolName
// @access  Public
exports.getSchoolLeaderboard = asyncHandler(async (req, res) => {
  const { schoolName } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const users = await User.find({
    role: 'student',
    isActive: true,
    'profile.school': schoolName
  })
    .select('name profile.grade gamification')
    .sort({ 'gamification.ecoPoints': -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit));

  const total = await User.countDocuments({
    role: 'student',
    isActive: true,
    'profile.school': schoolName
  });

  const leaderboard = users.map((user, index) => ({
    ...extractScoreComponentsFromUser(user),
    rank: parseInt(offset) + index + 1,
    name: user.name,
    grade: user.profile?.grade || 'N/A',
    ecoPoints: extractScoreComponentsFromUser(user).score,
    badges: user.gamification.badges.length,
    level: user.gamification.level
  }));

  res.status(200).json({
    success: true,
    schoolName,
    count: leaderboard.length,
    total,
    data: leaderboard
  });
});

// @desc    Get user ranking
// @route   GET /api/eco-points/ranking
// @access  Private
exports.getUserRanking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const rankData = await getUserRank({ userId: user._id, schoolId: user.profile?.schoolId });

  const totalStudents = await User.countDocuments({
    role: 'student',
    isActive: true
  });

  const schoolStudents = await User.countDocuments({
    'profile.school': user.profile.school,
    role: 'student',
    isActive: true
  });

  res.status(200).json({
    success: true,
    data: {
      globalRank: rankData?.globalRank || null,
      globalTotal: totalStudents,
      schoolRank: rankData?.schoolRank || null,
      schoolTotal: schoolStudents,
      userEcoPoints: extractScoreComponentsFromUser(user).score
    }
  });
});

// @desc    Get eco-points statistics
// @route   GET /api/eco-points/stats
// @access  Public
exports.getEcoPointsStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });

  const avgEcoPoints = await User.aggregate([
    { $match: { role: 'student', isActive: true } },
    { $group: { _id: null, avg: { $avg: '$gamification.ecoPoints' } } }
  ]);

  const totalEcoPointsGenerated = await User.aggregate([
    { $match: { role: 'student', isActive: true } },
    { $group: { _id: null, total: { $sum: '$gamification.ecoPoints' } } }
  ]);

  const topCategory = await EcoPointsTransaction.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$sourceType', count: { $sum: 1 }, totalPoints: { $sum: '$points' } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      averageEcoPoints: Math.round(avgEcoPoints[0]?.avg || 0),
      totalEcoPointsGenerated: totalEcoPointsGenerated[0]?.total || 0,
      mostPopularSourceType: topCategory[0]?._id || 'N/A',
      mostPopularSourceCount: topCategory[0]?.count || 0
    }
  });
});

// @desc    Get top eco-performers
// @route   GET /api/eco-points/top-performers
// @access  Public
exports.getTopPerformers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topPerformers = await User.find({ role: 'student', isActive: true })
    .select('name profile.school gamification')
    .sort({ 'gamification.ecoPoints': -1 })
    .limit(parseInt(limit));

  const data = topPerformers.map((user, index) => ({
    ...extractScoreComponentsFromUser(user),
    rank: index + 1,
    name: user.name,
    school: user.profile?.school || 'N/A',
    ecoPoints: extractScoreComponentsFromUser(user).score,
    badges: user.gamification.badges.length,
    level: user.gamification.level
  }));

  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});
