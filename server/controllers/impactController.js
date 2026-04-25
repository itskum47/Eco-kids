/**
 * Environmental Impact Controller
 * Handles environmental impact tracking and reporting endpoints
 */

const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const ImpactDailyAction = require('../models/ImpactDailyAction');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const { calculateEquivalents } = require('../utils/impactCalculator');
const { cacheService } = require('../services/cacheService');

const QUICK_ACTION_LIBRARY = {
  'shower-5min': {
    label: 'I took a 5-min shower',
    impact: { waterSaved: 10, co2Prevented: 0.5 }
  },
  'segregated-waste': {
    label: 'I segregated waste today',
    impact: { plasticReduced: 0.5, co2Prevented: 0.25 }
  },
  'turned-off-lights': {
    label: 'I turned off lights',
    impact: { energySaved: 0.2, co2Prevented: 0.14 }
  },
  'bus-instead-of-car': {
    label: 'I used bus instead of car',
    impact: { co2Prevented: 2 }
  },
  'planted-something': {
    label: 'I planted something',
    impact: { treesPlanted: 1, co2Prevented: 20 }
  }
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const IMPACT_PUBLIC_CACHE_NAMESPACE = 'impact_public';
const IMPACT_PUBLIC_CACHE_TTL = 60;

const getImpactCache = async (key) => {
  try {
    return await cacheService.get(key, IMPACT_PUBLIC_CACHE_NAMESPACE);
  } catch (_) {
    return null;
  }
};

const setImpactCache = async (key, value, ttl = IMPACT_PUBLIC_CACHE_TTL) => {
  try {
    await cacheService.set(key, value, ttl, IMPACT_PUBLIC_CACHE_NAMESPACE);
  } catch (_) {
    // Fail-open: cache errors should not affect API responses
  }
};

function parsePeriod(period = 'month') {
  const now = new Date();
  const map = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
    'all-time': null
  };
  const days = map[period] !== undefined ? map[period] : 30;
  if (days === null) return null;
  return new Date(now.getTime() - days * MS_IN_DAY);
}

function normalizeImpact(impact = {}) {
  return {
    co2Prevented: Number(impact.co2Prevented || 0),
    waterSaved: Number(impact.waterSaved || 0),
    plasticReduced: Number(impact.plasticReduced || 0),
    energySaved: Number(impact.energySaved || 0),
    treesPlanted: Number(impact.treesPlanted || 0)
  };
}

async function aggregateImpactForUser(userId, period = 'month') {
  const normalizedUserId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;
  const since = parsePeriod(period);
  const match = { userId: normalizedUserId };
  if (since) {
    match.actionDate = { $gte: since };
  }

  const rows = await ImpactDailyAction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        co2Prevented: { $sum: '$impact.co2Prevented' },
        waterSaved: { $sum: '$impact.waterSaved' },
        plasticReduced: { $sum: '$impact.plasticReduced' },
        energySaved: { $sum: '$impact.energySaved' },
        treesPlanted: { $sum: '$impact.treesPlanted' },
        actionsCount: { $sum: 1 }
      }
    }
  ]);

  return rows[0] || {
    co2Prevented: 0,
    waterSaved: 0,
    plasticReduced: 0,
    energySaved: 0,
    treesPlanted: 0,
    actionsCount: 0
  };
}

function calculateMonthlyDelta(baseline = {}, current = {}) {
  const baseCO2 = Number(baseline.co2 || 0);
  const currentCO2 = Number(current.co2Prevented || 0);
  const deltaCO2 = baseCO2 - currentCO2;
  const percentChange = baseCO2 > 0 ? (deltaCO2 / baseCO2) * 100 : 0;
  const equivalentTrees = deltaCO2 / 20;

  return {
    deltaCO2,
    percentChange,
    equivalentTrees,
    waterDelta: Number(baseline.water || 0) - Number(current.waterSaved || 0),
    plasticDelta: Number(baseline.plastic || 0) - Number(current.plasticReduced || 0),
    energyDelta: Number(baseline.energy || 0) - Number(current.energySaved || 0)
  };
}

exports.getImpactStats = asyncHandler(async (req, res) => {
  const cacheKey = 'stats:v1';
  const cached = await getImpactCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    const [submissionAgg, userAgg] = await Promise.all([
      ActivitySubmission.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: null,
            treesPlanted: {
              $sum: {
                $cond: [{ $eq: ['$activityType', 'tree-planting'] }, 1, 0]
              }
            },
            co2Saved: {
              $sum: {
                $cond: [{ $in: ['$activityType', ['tree-planting', 'energy-saving', 'plastic-reduction', 'waste-recycling', 'composting', 'biodiversity-survey']] }, 5, 0]
              }
            },
            waterSaved: {
              $sum: {
                $cond: [{ $eq: ['$activityType', 'water-saving'] }, 100, 0]
              }
            }
          }
        }
      ]),
      User.aggregate([
        { $match: { role: 'student', isActive: true } },
        {
          $group: {
            _id: null,
            studentsActive: { $sum: 1 },
            schools: { $addToSet: '$profile.school' }
          }
        }
      ])
    ]);

    const submissionData = submissionAgg[0] || {};
    const userData = userAgg[0] || {};

    const response = {
      success: true,
      data: {
        treesPlanted: submissionData.treesPlanted || 0,
        co2Saved: submissionData.co2Saved || 0,
        waterSaved: submissionData.waterSaved || 0,
        schoolsJoined: (userData.schools || []).filter(Boolean).length,
        studentsActive: userData.studentsActive || 0
      }
    };

    await setImpactCache(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    // If MongoDB is unavailable, return default stats
    console.warn('Failed to fetch impact stats from MongoDB:', error.message);
    res.status(200).json({
      success: true,
      data: {
        treesPlanted: 0,
        co2Saved: 0,
        waterSaved: 0,
        schoolsJoined: 0,
        studentsActive: 0
      },
      note: 'Stats unavailable - database connection error'
    });
  }
});

/**
 * @desc    Get current user's environmental impact
 * @route   GET /api/impact/me
 * @access  Private
 */
exports.getMyImpact = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('environmentalImpact');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const equivalents = calculateEquivalents(user.environmentalImpact);

  res.status(200).json({
    success: true,
    data: {
      environmentalImpact: user.environmentalImpact,
      equivalents
    }
  });
});

/**
 * @desc    Get global environmental impact statistics
 * @route   GET /api/impact/global
 * @access  Public
 */
exports.getGlobalImpact = asyncHandler(async (req, res) => {
  const cacheKey = 'global:v1';
  const cached = await getImpactCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const stats = await User.aggregate([
    {
      $match: { role: 'student' }
    },
    {
      $group: {
        _id: null,
        totalTreesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        totalCO2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        totalWaterSaved: { $sum: '$environmentalImpact.waterSaved' },
        totalPlasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        totalEnergySaved: { $sum: '$environmentalImpact.energySaved' },
        totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' },
        totalStudentsParticipating: { $sum: 1 }
      }
    }
  ]);

  const globalImpact = stats[0] || {
    _id: null,
    totalTreesPlanted: 0,
    totalCO2Prevented: 0,
    totalWaterSaved: 0,
    totalPlasticReduced: 0,
    totalEnergySaved: 0,
    totalActivities: 0,
    totalStudentsParticipating: 0
  };

  const equivalents = calculateEquivalents({
    treesPlanted: globalImpact.totalTreesPlanted,
    co2Prevented: globalImpact.totalCO2Prevented,
    waterSaved: globalImpact.totalWaterSaved,
    plasticReduced: globalImpact.totalPlasticReduced,
    energySaved: globalImpact.totalEnergySaved,
    activitiesCompleted: globalImpact.totalActivities
  });

  const response = {
    success: true,
    data: {
      globalImpact: {
        treesPlanted: globalImpact.totalTreesPlanted,
        co2Prevented: globalImpact.totalCO2Prevented,
        waterSaved: globalImpact.totalWaterSaved,
        plasticReduced: globalImpact.totalPlasticReduced,
        energySaved: globalImpact.totalEnergySaved,
        activitiesCompleted: globalImpact.totalActivities,
        studentsParticipating: globalImpact.totalStudentsParticipating
      },
      equivalents
    }
  };

  await setImpactCache(cacheKey, response);
  res.status(200).json(response);
});

/**
 * @desc    Get school/district environmental impact
 * @route   GET /api/impact/school/:schoolName
 * @access  Public
 */
exports.getSchoolImpact = asyncHandler(async (req, res) => {
  const { schoolName } = req.params;
  const cacheKey = `school:${encodeURIComponent(String(schoolName || '').toLowerCase())}:v1`;
  const cached = await getImpactCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const stats = await User.aggregate([
    {
      $match: {
        role: 'student',
        'profile.school': schoolName
      }
    },
    {
      $group: {
        _id: null,
        totalTreesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        totalCO2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        totalWaterSaved: { $sum: '$environmentalImpact.waterSaved' },
        totalPlasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        totalEnergySaved: { $sum: '$environmentalImpact.energySaved' },
        totalActivities: { $sum: '$environmentalImpact.activitiesCompleted' },
        studentCount: { $sum: 1 }
      }
    }
  ]);

  const schoolImpact = stats[0] || {
    _id: null,
    totalTreesPlanted: 0,
    totalCO2Prevented: 0,
    totalWaterSaved: 0,
    totalPlasticReduced: 0,
    totalEnergySaved: 0,
    totalActivities: 0,
    studentCount: 0
  };

  const equivalents = calculateEquivalents({
    treesPlanted: schoolImpact.totalTreesPlanted,
    co2Prevented: schoolImpact.totalCO2Prevented,
    waterSaved: schoolImpact.totalWaterSaved,
    plasticReduced: schoolImpact.totalPlasticReduced,
    energySaved: schoolImpact.totalEnergySaved,
    activitiesCompleted: schoolImpact.totalActivities
  });

  const response = {
    success: true,
    school: schoolName,
    data: {
      schoolImpact: {
        treesPlanted: schoolImpact.totalTreesPlanted,
        co2Prevented: schoolImpact.totalCO2Prevented,
        waterSaved: schoolImpact.totalWaterSaved,
        plasticReduced: schoolImpact.totalPlasticReduced,
        energySaved: schoolImpact.totalEnergySaved,
        activitiesCompleted: schoolImpact.totalActivities,
        studentCount: schoolImpact.studentCount,
        averageImpactPerStudent: {
          co2Prevented: Math.round(
            (schoolImpact.totalCO2Prevented / Math.max(schoolImpact.studentCount, 1)) * 100
          ) / 100
        }
      },
      equivalents
    }
  };

  await setImpactCache(cacheKey, response);
  res.status(200).json(response);
});

/**
 * @desc    Get top environmental contributors (leaderboard by impact)
 * @route   GET /api/impact/leaderboard
 * @access  Public
 */
exports.getImpactLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, metric = 'co2Prevented' } = req.query;

  const validMetrics = [
    'co2Prevented',
    'treesPlanted',
    'waterSaved',
    'plasticReduced',
    'energySaved',
    'activitiesCompleted'
  ];

  if (!validMetrics.includes(metric)) {
    return res.status(400).json({
      success: false,
      message: `Invalid metric. Must be one of: ${validMetrics.join(', ')}`
    });
  }

  const cacheKey = `leaderboard:${metric}:${Number(limit) || 50}:${Number(offset) || 0}:v1`;
  const cached = await getImpactCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const sortObj = {};
  sortObj[`environmentalImpact.${metric}`] = -1;

  const users = await User.find({ role: 'student', isActive: true })
    .select('name profile.school profile.avatar environmentalImpact')
    .sort(sortObj)
    .skip(parseInt(offset))
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments({ role: 'student', isActive: true });

  const leaderboard = users.map((user, index) => ({
    rank: parseInt(offset) + index + 1,
    name: user.name,
    school: user.profile?.school || 'N/A',
    avatar: user.profile?.avatar,
    [metric]: user.environmentalImpact?.[metric] || 0,
    co2Prevented: user.environmentalImpact?.co2Prevented || 0,
    treesPlanted: user.environmentalImpact?.treesPlanted || 0,
    activitiesCompleted: user.environmentalImpact?.activitiesCompleted || 0
  }));

  const response = {
    success: true,
    metric,
    count: leaderboard.length,
    total,
    pages: Math.ceil(total / limit),
    data: leaderboard
  };

  await setImpactCache(cacheKey, response);
  res.status(200).json(response);
});

/**
 * @desc    Get district environmental impact comparison
 * @route   GET /api/impact/district/:districtName
 * @access  Public
 */
exports.getDistrictImpact = asyncHandler(async (req, res) => {
  const { districtName } = req.params;
  const { limit = 20 } = req.query;
  const cacheKey = `district:${encodeURIComponent(String(districtName || '').toLowerCase())}:${Number(limit) || 20}:v1`;
  const cached = await getImpactCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const schoolStats = await User.aggregate([
    {
      $match: {
        role: 'student',
        'profile.state': districtName
      }
    },
    {
      $group: {
        _id: '$profile.school',
        co2Prevented: { $sum: '$environmentalImpact.co2Prevented' },
        treesPlanted: { $sum: '$environmentalImpact.treesPlanted' },
        waterSaved: { $sum: '$environmentalImpact.waterSaved' },
        plasticReduced: { $sum: '$environmentalImpact.plasticReduced' },
        energySaved: { $sum: '$environmentalImpact.energySaved' },
        activitiesCompleted: { $sum: '$environmentalImpact.activitiesCompleted' },
        studentCount: { $sum: 1 }
      }
    },
    {
      $sort: { co2Prevented: -1 }
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  const totalGlobalStats = await User.aggregate([
    {
      $match: {
        role: 'student',
        'profile.state': districtName
      }
    },
    {
      $group: {
        _id: null,
        totalCO2: { $sum: '$environmentalImpact.co2Prevented' },
        totalTrees: { $sum: '$environmentalImpact.treesPlanted' },
        totalStudents: { $sum: 1 }
      }
    }
  ]);

  const globalStats = totalGlobalStats[0] || {
    totalCO2: 0,
    totalTrees: 0,
    totalStudents: 0
  };

  const schoolsData = schoolStats.map((school, index) => ({
    rank: index + 1,
    schoolName: school._id,
    co2Prevented: school.co2Prevented,
    treesPlanted: school.treesPlanted,
    waterSaved: school.waterSaved,
    plasticReduced: school.plasticReduced,
    energySaved: school.energySaved,
    activitiesCompleted: school.activitiesCompleted,
    studentCount: school.studentCount,
    averageCO2PerStudent: Math.round((school.co2Prevented / school.studentCount) * 100) / 100
  }));

  const response = {
    success: true,
    district: districtName,
    globalStats: {
      totalCO2Prevented: globalStats.totalCO2,
      totalTreesPlanted: globalStats.totalTrees,
      totalStudentsParticipating: globalStats.totalStudents,
      averageCO2PerStudent: Math.round((globalStats.totalCO2 / Math.max(globalStats.totalStudents, 1)) * 100) / 100
    },
    schoolRankings: schoolsData
  };

  await setImpactCache(cacheKey, response);
  res.status(200).json(response);
});

/**
 * @desc    Get user impact history (for dashboard charts)
 * @route   GET /api/impact/me/history
 * @access  Private
 */
exports.getUserImpactHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('environmentalImpact')
    .lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Format for chart display
  const chartData = [
    {
      metric: 'Trees Planted',
      value: user.environmentalImpact.treesPlanted,
      unit: 'trees',
      color: '#10b981'
    },
    {
      metric: 'CO₂ Prevented',
      value: Math.round(user.environmentalImpact.co2Prevented * 100) / 100,
      unit: 'kg',
      color: '#8b5cf6'
    },
    {
      metric: 'Water Saved',
      value: Math.round(user.environmentalImpact.waterSaved * 100) / 100,
      unit: 'litres',
      color: '#3b82f6'
    },
    {
      metric: 'Plastic Reduced',
      value: Math.round(user.environmentalImpact.plasticReduced * 100) / 100,
      unit: 'kg',
      color: '#f59e0b'
    },
    {
      metric: 'Energy Saved',
      value: Math.round(user.environmentalImpact.energySaved * 100) / 100,
      unit: 'kWh',
      color: '#ec4899'
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      environmentalImpact: user.environmentalImpact,
      chartData
    }
  });
});

/**
 * @desc    Log a quick daily impact action
 * @route   POST /api/v1/impact/daily-action
 * @access  Private
 */
exports.logDailyImpactAction = asyncHandler(async (req, res) => {
  const { actionType, date, value, customImpact } = req.body;

  if (!actionType) {
    return res.status(400).json({
      success: false,
      message: 'actionType is required'
    });
  }

  const preset = QUICK_ACTION_LIBRARY[actionType];
  const computedImpact = preset
    ? normalizeImpact(preset.impact)
    : normalizeImpact(customImpact || {});

  if (Number(value || 0) > 0) {
    computedImpact.co2Prevented += Number(value);
  }

  const action = await ImpactDailyAction.create({
    userId: req.user.id,
    actionType,
    actionDate: date ? new Date(date) : new Date(),
    impact: computedImpact,
    metadata: {
      label: preset?.label || 'Custom action',
      source: preset ? 'quick-action' : 'custom-action',
      customValue: Number(value || 0)
    }
  });

  await User.findByIdAndUpdate(req.user.id, {
    $inc: {
      'environmentalImpact.co2Prevented': computedImpact.co2Prevented,
      'environmentalImpact.waterSaved': computedImpact.waterSaved,
      'environmentalImpact.plasticReduced': computedImpact.plasticReduced,
      'environmentalImpact.energySaved': computedImpact.energySaved,
      'environmentalImpact.treesPlanted': computedImpact.treesPlanted,
      'environmentalImpact.activitiesCompleted': 1
    },
    $set: { 'environmentalImpact.lastImpactUpdate': new Date() }
  });

  const monthlyMetrics = await aggregateImpactForUser(req.user.id, 'month');
  const user = await User.findById(req.user.id).select('impactBaseline');
  const delta = calculateMonthlyDelta(user?.impactBaseline || {}, monthlyMetrics);

  if (delta.percentChange >= 10) {
    await Notification.create({
      userId: req.user.id,
      type: 'system',
      title: 'Monthly Eco Milestone',
      message: `You reduced CO2 by ${delta.percentChange.toFixed(1)}% this month. Keep going!`,
      data: { metric: 'co2', percentChange: delta.percentChange }
    }).catch(() => {});
  }

  await cacheService.invalidateNamespace(IMPACT_PUBLIC_CACHE_NAMESPACE).catch(() => {});

  res.status(201).json({
    success: true,
    data: {
      action,
      impact: computedImpact,
      monthlyMetrics,
      message: `Great! You saved ${computedImpact.co2Prevented.toFixed(2)} kg CO2 today!`
    }
  });
});

/**
 * @desc    Get personal impact metrics by period
 * @route   GET /api/v1/impact/me/metrics
 * @access  Private
 */
exports.getMyImpactMetrics = asyncHandler(async (req, res) => {
  const period = req.query.period || 'month';
  const metrics = await aggregateImpactForUser(req.user.id, period);

  res.status(200).json({
    success: true,
    data: {
      period,
      co2: metrics.co2Prevented,
      water: metrics.waterSaved,
      plastic: metrics.plasticReduced,
      energy: metrics.energySaved,
      trees: metrics.treesPlanted,
      actionsCount: metrics.actionsCount
    }
  });
});

/**
 * @desc    Get impact baseline
 * @route   GET /api/v1/impact/baseline
 * @access  Private
 */
exports.getImpactBaseline = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('impactBaseline');
  res.status(200).json({
    success: true,
    data: user?.impactBaseline?.createdAt ? user.impactBaseline : null
  });
});

/**
 * @desc    Set or update impact baseline
 * @route   POST /api/v1/impact/baseline
 * @access  Private
 */
exports.setImpactBaseline = asyncHandler(async (req, res) => {
  const {
    co2,
    water,
    plastic,
    energy,
    trees,
    showerDuration,
    transportMode,
    meatDaysPerWeek,
    waterUsagePerDay
  } = req.body;

  let computedCO2 = Number(co2 || 0);
  if (!computedCO2) {
    const shower = Number(showerDuration || 0) * 1.5 * 0.08;
    const transportFactor = transportMode === 'car' ? 0.4 : transportMode === 'bus' ? 0.05 : 0.01;
    const transport = 10 * transportFactor;
    const meat = Number(meatDaysPerWeek || 0) * 3;
    const waterFootprint = Number(waterUsagePerDay || 0) * 0.001;
    computedCO2 = shower + transport + meat + waterFootprint;
  }

  const now = new Date();
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        impactBaseline: {
          co2: computedCO2,
          water: Number(water || waterUsagePerDay || 0),
          plastic: Number(plastic || 0),
          energy: Number(energy || 0),
          trees: Number(trees || 0),
          sourceSurvey: {
            showerDuration: Number(showerDuration || 0),
            transportMode,
            meatDaysPerWeek: Number(meatDaysPerWeek || 0),
            waterUsagePerDay: Number(waterUsagePerDay || 0)
          },
          createdAt: now,
          updatedAt: now
        }
      }
    },
    { new: true, select: 'impactBaseline' }
  );

  res.status(200).json({ success: true, data: user.impactBaseline });
});

/**
 * @desc    Get baseline vs current comparison
 * @route   GET /api/v1/impact/comparison
 * @access  Private
 */
exports.getImpactComparison = asyncHandler(async (req, res) => {
  const period = req.query.period || 'month';
  const [user, current] = await Promise.all([
    User.findById(req.user.id).select('impactBaseline'),
    aggregateImpactForUser(req.user.id, period)
  ]);

  const baseline = user?.impactBaseline || null;
  const delta = calculateMonthlyDelta(baseline || {}, current);

  res.status(200).json({
    success: true,
    data: {
      period,
      baseline,
      current: {
        co2: current.co2Prevented,
        water: current.waterSaved,
        plastic: current.plasticReduced,
        energy: current.energySaved,
        trees: current.treesPlanted
      },
      delta
    }
  });
});

/**
 * @desc    Get monthly trend for charts
 * @route   GET /api/v1/impact/trend
 * @access  Private
 */
exports.getImpactTrend = asyncHandler(async (req, res) => {
  const months = Math.max(3, Math.min(Number(req.query.months || 6), 24));
  const normalizedUserId = mongoose.Types.ObjectId.isValid(req.user.id)
    ? new mongoose.Types.ObjectId(req.user.id)
    : req.user.id;
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - (months - 1));
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);

  const trendRows = await ImpactDailyAction.aggregate([
    {
      $match: {
        userId: normalizedUserId,
        actionDate: { $gte: since }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$actionDate' },
          month: { $month: '$actionDate' }
        },
        co2: { $sum: '$impact.co2Prevented' },
        water: { $sum: '$impact.waterSaved' },
        plastic: { $sum: '$impact.plasticReduced' },
        energy: { $sum: '$impact.energySaved' },
        trees: { $sum: '$impact.treesPlanted' }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        co2: 1,
        water: 1,
        plastic: 1,
        energy: 1,
        trees: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);

  const baseline = await User.findById(req.user.id).select('impactBaseline.co2').lean();
  const baselineCO2 = Number(baseline?.impactBaseline?.co2 || 0);
  const data = trendRows.map((row) => ({
    ...row,
    label: `${String(row.month).padStart(2, '0')}/${row.year}`,
    baselineCo2: baselineCO2
  }));

  res.status(200).json({ success: true, data });
});
