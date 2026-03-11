const User = require('../models/User');
const asyncHandler = require('../middleware/async');

exports.getSchoolLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  const stats = await User.aggregate([
    { $match: { role: 'student', isActive: true } },
    {
      $group: {
        _id: '$profile.school',
        schoolName: { $first: '$profile.school' },
        co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        waterSaved: { $sum: '$environmentalImpact.waterSaved' },
        energySaved: { $sum: '$environmentalImpact.energySaved' },
        activitiesCompleted: { $sum: '$environmentalImpact.activitiesCompleted' },
        studentCount: { $sum: 1 }
      }
    },
    { $match: { schoolName: { $ne: null } } },
    { $sort: { co2Prevented: -1 } },
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) }
  ]);

  const total = await User.aggregate([
    { $match: { role: 'student', isActive: true, 'profile.school': { $ne: null } } },
    {
      $group: {
        _id: '$profile.school'
      }
    },
    { $count: 'total' }
  ]);

  const leaderboard = stats.map((item, index) => ({
    rank: parseInt(offset) + index + 1,
    schoolName: item.schoolName || 'N/A',
    co2Prevented: Math.round(item.co2Prevented * 100) / 100,
    treesPlanted: Math.round(item.treesPlanted),
    plasticReduced: Math.round(item.plasticReduced * 100) / 100,
    waterSaved: Math.round(item.waterSaved),
    energySaved: Math.round(item.energySaved * 100) / 100,
    activitiesCompleted: item.activitiesCompleted,
    studentCount: item.studentCount
  }));

  res.status(200).json({
    success: true,
    count: leaderboard.length,
    total: total[0]?.total || 0,
    data: leaderboard
  });
});

exports.getDistrictLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  const stats = await User.aggregate([
    { $match: { role: 'student', isActive: true } },
    {
      $group: {
        _id: '$profile.district',
        districtName: { $first: '$profile.district' },
        co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        waterSaved: { $sum: '$environmentalImpact.waterSaved' },
        energySaved: { $sum: '$environmentalImpact.energySaved' },
        activitiesCompleted: { $sum: '$environmentalImpact.activitiesCompleted' },
        studentCount: { $sum: 1 }
      }
    },
    { $match: { districtName: { $ne: null } } },
    { $sort: { co2Prevented: -1 } },
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) }
  ]);

  const total = await User.aggregate([
    { $match: { role: 'student', isActive: true, 'profile.district': { $ne: null } } },
    {
      $group: {
        _id: '$profile.district'
      }
    },
    { $count: 'total' }
  ]);

  const leaderboard = stats.map((item, index) => ({
    rank: parseInt(offset) + index + 1,
    districtName: item.districtName || 'N/A',
    co2Prevented: Math.round(item.co2Prevented * 100) / 100,
    treesPlanted: Math.round(item.treesPlanted),
    plasticReduced: Math.round(item.plasticReduced * 100) / 100,
    waterSaved: Math.round(item.waterSaved),
    energySaved: Math.round(item.energySaved * 100) / 100,
    activitiesCompleted: item.activitiesCompleted,
    studentCount: item.studentCount
  }));

  res.status(200).json({
    success: true,
    count: leaderboard.length,
    total: total[0]?.total || 0,
    data: leaderboard
  });
});

exports.getStateLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  const stats = await User.aggregate([
    { $match: { role: 'student', isActive: true } },
    {
      $group: {
        _id: '$profile.state',
        stateName: { $first: '$profile.state' },
        co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        waterSaved: { $sum: '$environmentalImpact.waterSaved' },
        energySaved: { $sum: '$environmentalImpact.energySaved' },
        activitiesCompleted: { $sum: '$environmentalImpact.activitiesCompleted' },
        studentCount: { $sum: 1 }
      }
    },
    { $match: { stateName: { $ne: null } } },
    { $sort: { co2Prevented: -1 } },
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) }
  ]);

  const total = await User.aggregate([
    { $match: { role: 'student', isActive: true, 'profile.state': { $ne: null } } },
    {
      $group: {
        _id: '$profile.state'
      }
    },
    { $count: 'total' }
  ]);

  const leaderboard = stats.map((item, index) => ({
    rank: parseInt(offset) + index + 1,
    stateName: item.stateName || 'N/A',
    co2Prevented: Math.round(item.co2Prevented * 100) / 100,
    treesPlanted: Math.round(item.treesPlanted),
    plasticReduced: Math.round(item.plasticReduced * 100) / 100,
    waterSaved: Math.round(item.waterSaved),
    energySaved: Math.round(item.energySaved * 100) / 100,
    activitiesCompleted: item.activitiesCompleted,
    studentCount: item.studentCount
  }));

  res.status(200).json({
    success: true,
    count: leaderboard.length,
    total: total[0]?.total || 0,
    data: leaderboard
  });
});

const { redisClient } = require('../services/cacheService');

exports.getStudentLeaderboard = asyncHandler(async (req, res) => {
  const { limit, offset = 0, metric = 'co2Prevented', userId } = req.query;

  const validMetrics = [
    'co2Prevented',
    'treesPlanted',
    'plasticReduced',
    'waterSaved',
    'energySaved',
    'activitiesCompleted'
  ];

  if (!validMetrics.includes(metric)) {
    return res.status(400).json({
      success: false,
      message: `Invalid metric. Must be one of: ${validMetrics.join(', ')}`
    });
  }

  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 50;

  const safeLimit = Math.min(
    Math.max(parseInt(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const formatUser = (user, rankOffset) => ({
    rank: rankOffset + 1, // ZREVRANK returns 0-based indexing
    id: user._id.toString(),
    name: user.name,
    school: user.profile?.school || 'N/A',
    district: user.profile?.district || 'N/A',
    state: user.profile?.state || 'N/A',
    avatar: user.profile?.avatar,
    co2Prevented: Math.round((user.environmentalImpact?.co2Prevented || 0) * 100) / 100,
    treesPlanted: Math.round(user.environmentalImpact?.treesPlanted || 0),
    plasticReduced: Math.round((user.environmentalImpact?.plasticReduced || 0) * 100) / 100,
    waterSaved: Math.round(user.environmentalImpact?.waterSaved || 0),
    energySaved: Math.round((user.environmentalImpact?.energySaved || 0) * 100) / 100,
    activitiesCompleted: user.environmentalImpact?.activitiesCompleted || 0
  });

  if (userId) {
    const zsetKey = `leaderboard:student:${metric}`;

    const totalUsers = await redisClient.zcard(zsetKey);
    const topLeadersData = await redisClient.zrevrange(zsetKey, 0, 2, 'WITHSCORES');
    const userRankRedis = await redisClient.zrevrank(zsetKey, userId);

    let neighborhoodData = [];
    let startNeighborhood = 0;

    if (userRankRedis !== null) {
      startNeighborhood = Math.max(3, userRankRedis - 2);
      const endNeighborhood = Math.min(totalUsers - 1, userRankRedis + 2);

      if (startNeighborhood <= endNeighborhood) {
        neighborhoodData = await redisClient.zrevrange(zsetKey, startNeighborhood, endNeighborhood, 'WITHSCORES');
      }
    }

    const idsToHydrate = new Set();
    for (let i = 0; i < topLeadersData.length; i += 2) idsToHydrate.add(topLeadersData[i]);
    for (let i = 0; i < neighborhoodData.length; i += 2) idsToHydrate.add(neighborhoodData[i]);

    const users = await User.find({ _id: { $in: Array.from(idsToHydrate) } })
      .select('name profile.school profile.district profile.state profile.avatar environmentalImpact')
      .lean();

    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const topLeaders = [];
    for (let i = 0; i < topLeadersData.length; i += 2) {
      const id = topLeadersData[i];
      const u = userMap[id];
      if (u) topLeaders.push(formatUser(u, i / 2));
    }

    const neighborhood = [];
    for (let i = 0; i < neighborhoodData.length; i += 2) {
      const id = neighborhoodData[i];
      const u = userMap[id];
      if (u) neighborhood.push(formatUser(u, startNeighborhood + (i / 2)));
    }

    let currentUserRank = null;
    if (userRankRedis !== null && userMap[userId]) {
      currentUserRank = formatUser(userMap[userId], userRankRedis);
    }

    return res.status(200).json({
      success: true,
      data: {
        topLeaders,
        neighborhood,
        currentUserRank
      }
    });
  }

  const sortObj = {};
  sortObj[`environmentalImpact.${metric}`] = -1;
  sortObj['_id'] = 1; // Tie-breaker for stable rank

  const users = await User.find({ role: 'student', isActive: true })
    .select(
      'name profile.school profile.district profile.state profile.avatar environmentalImpact'
    )
    .sort(sortObj)
    .skip(parseInt(offset) || 0)
    .limit(safeLimit)
    .lean();

  const total = await User.countDocuments({ role: 'student', isActive: true });

  const leaderboard = users.map((user, index) => formatUser(user, (parseInt(offset) || 0) + index));

  res.status(200).json({
    success: true,
    metric,
    count: leaderboard.length,
    total,
    data: leaderboard
  });
});
