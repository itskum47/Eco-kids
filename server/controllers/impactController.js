/**
 * Environmental Impact Controller
 * Handles environmental impact tracking and reporting endpoints
 */

const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const asyncHandler = require('../middleware/async');
const { calculateEquivalents } = require('../utils/impactCalculator');

exports.getImpactStats = asyncHandler(async (req, res) => {
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

  res.status(200).json({
    success: true,
    data: {
      treesPlanted: submissionData.treesPlanted || 0,
      co2Saved: submissionData.co2Saved || 0,
      waterSaved: submissionData.waterSaved || 0,
      schoolsJoined: (userData.schools || []).filter(Boolean).length,
      studentsActive: userData.studentsActive || 0
    }
  });
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

  res.status(200).json({
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
  });
});

/**
 * @desc    Get school/district environmental impact
 * @route   GET /api/impact/school/:schoolName
 * @access  Public
 */
exports.getSchoolImpact = asyncHandler(async (req, res) => {
  const { schoolName } = req.params;

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

  res.status(200).json({
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
  });
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

  res.status(200).json({
    success: true,
    metric,
    count: leaderboard.length,
    total,
    pages: Math.ceil(total / limit),
    data: leaderboard
  });
});

/**
 * @desc    Get district environmental impact comparison
 * @route   GET /api/impact/district/:districtName
 * @access  Public
 */
exports.getDistrictImpact = asyncHandler(async (req, res) => {
  const { districtName } = req.params;
  const { limit = 20 } = req.query;

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

  res.status(200).json({
    success: true,
    district: districtName,
    globalStats: {
      totalCO2Prevented: globalStats.totalCO2,
      totalTreesPlanted: globalStats.totalTrees,
      totalStudentsParticipating: globalStats.totalStudents,
      averageCO2PerStudent: Math.round((globalStats.totalCO2 / Math.max(globalStats.totalStudents, 1)) * 100) / 100
    },
    schoolRankings: schoolsData
  });
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
