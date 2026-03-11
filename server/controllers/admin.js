const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Quiz = require('../models/Quiz');
const Game = require('../models/Game');
const Experiment = require('../models/Experiment');
const Progress = require('../models/Progress');
const ErrorResponse = require('../utils/errorResponse');
const { paginate, paginatedResponse } = require('../utils/paginate');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalTopics = await Topic.countDocuments();
  const totalQuizzes = await Quiz.countDocuments();
  const totalGames = await Game.countDocuments();
  const totalExperiments = await Experiment.countDocuments();

  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Get active users (logged in within last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers = await User.countDocuments({
    lastLoginAt: { $gte: sevenDaysAgo }
  });

  const stats = {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalTopics,
    totalQuizzes,
    totalGames,
    totalExperiments,
    newUsersThisMonth,
    activeUsers
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);

  const total = await User.countDocuments();

  const users = await User.find()
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.status(200).json(paginatedResponse(users, total, page, limit));
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get user's progress
  const progress = await Progress.findOne({ user: req.params.id });

  res.status(200).json({
    success: true,
    data: {
      user,
      progress
    }
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get content statistics
// @route   GET /api/admin/content/stats
// @access  Private/Admin
exports.getContentStats = asyncHandler(async (req, res, next) => {
  const topicsByCategory = await Topic.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  const quizStats = await Quiz.aggregate([
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 }
      }
    }
  ]);

  const experimentStats = await Experiment.aggregate([
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 }
      }
    }
  ]);

  const gameStats = await Game.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      topicsByCategory,
      quizStats,
      experimentStats,
      gameStats
    }
  });
});

// @desc    Get user activity analytics
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
exports.getUserAnalytics = asyncHandler(async (req, res, next) => {
  // User registrations by month
  const registrationsByMonth = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Users by state/region
  const usersByRegion = await User.aggregate([
    {
      $group: {
        _id: '$state',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Users by grade
  const usersByGrade = await User.aggregate([
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      registrationsByMonth,
      usersByRegion,
      usersByGrade
    }
  });
});

// @desc    Get learning analytics
// @route   GET /api/admin/analytics/learning
// @access  Private/Admin
exports.getLearningAnalytics = asyncHandler(async (req, res, next) => {
  // Most popular topics
  const popularTopics = await Progress.aggregate([
    { $unwind: '$completedTopics' },
    {
      $group: {
        _id: '$completedTopics.topic',
        completionCount: { $sum: 1 },
        avgTimeSpent: { $avg: '$completedTopics.timeSpent' }
      }
    },
    {
      $lookup: {
        from: 'topics',
        localField: '_id',
        foreignField: '_id',
        as: 'topic'
      }
    },
    { $unwind: '$topic' },
    {
      $sort: { completionCount: -1 }
    },
    { $limit: 10 }
  ]);

  // Quiz performance statistics
  const quizPerformance = await Progress.aggregate([
    { $unwind: '$quizAttempts' },
    {
      $group: {
        _id: '$quizAttempts.quiz',
        avgScore: { $avg: '$quizAttempts.percentage' },
        totalAttempts: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: '_id',
        foreignField: '_id',
        as: 'quiz'
      }
    },
    { $unwind: '$quiz' },
    {
      $sort: { totalAttempts: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      popularTopics,
      quizPerformance
    }
  });
});

// @desc    Bulk operations for users
// @route   POST /api/admin/users/bulk
// @access  Private/Admin
exports.bulkUserOperations = asyncHandler(async (req, res, next) => {
  const { operation, userIds, data } = req.body;

  let result;

  switch (operation) {
    case 'activate':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: true }
      );
      break;

    case 'deactivate':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: false }
      );
      break;

    case 'delete':
      result = await User.deleteMany({ _id: { $in: userIds } });
      break;

    case 'updateRole':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { role: data.role }
      );
      break;

    default:
      return next(new ErrorResponse('Invalid bulk operation', 400));
  }

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get all submissions across experiments for admin review
// @route   GET /api/admin/submissions
// @access  Private/Admin
exports.getAllSubmissions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const status = req.query.status || null; // 'pending', 'approved', 'rejected'

  // Get all experiments and flatten submissions
  let query = {};
  if (status) {
    query['submissions.status'] = status;
  }

  const experiments = await Experiment.find(query)
    .select('title slug submissions ecoPointsReward')
    .populate('submissions.user', 'name email profile.school profile.grade');

  // Flatten submissions with experiment info
  const allSubmissions = [];
  experiments.forEach(exp => {
    exp.submissions.forEach(sub => {
      allSubmissions.push({
        _id: sub._id,
        experimentId: exp._id,
        experimentTitle: exp.title,
        experimentSlug: exp.slug,
        user: sub.user,
        observations: sub.observations,
        results: sub.results,
        photos: sub.photos || [],
        status: sub.status,
        rating: sub.rating,
        points: sub.points || exp.ecoPointsReward,
        submittedAt: sub.submittedAt,
        reviewedAt: sub.reviewedAt,
        teacherFeedback: sub.teacherFeedback
      });
    });
  });

  // Sort by submitted date (newest first)
  allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  // Paginate
  const total = allSubmissions.length;
  const startIdx = (page - 1) * limit;
  const paginatedSubmissions = allSubmissions.slice(startIdx, startIdx + limit);

  res.status(200).json({
    success: true,
    data: paginatedSubmissions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSubmissions: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// @desc    Get leaderboard (top users by eco-points)
// @route   GET /api/admin/leaderboard
// @access  Private/Admin
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 100;

  const leaderboard = await User.find({ role: 'student' })
    .select('name profile.school profile.grade gamification.ecoPoints')
    .sort({ 'gamification.ecoPoints': -1 })
    .limit(limit)
    .lean();

  // Add rank
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    name: user.name,
    school: user.profile?.school,
    grade: user.profile?.grade,
    ecoPoints: user.gamification?.ecoPoints || 0
  }));

  res.status(200).json({
    success: true,
    data: rankedLeaderboard
  });
});

// @desc    Get dashboard overview (aggregate counts)
// @route   GET /api/admin/overview
// @access  Private/Admin
exports.getOverview = asyncHandler(async (req, res, next) => {
  // Count submissions by status using aggregation (OOM safe)
  const expAggr = await Experiment.aggregate([
    { $unwind: { path: '$submissions', preserveNullAndEmptyArrays: false } },
    { $group: { _id: '$submissions.status', count: { $sum: 1 } } }
  ]);

  let totalSubmissions = 0;
  let approvedSubmissions = 0;
  let pendingSubmissions = 0;
  let rejectedSubmissions = 0;

  expAggr.forEach(s => {
    totalSubmissions += s.count;
    if (s._id === 'approved') approvedSubmissions = s.count;
    if (s._id === 'pending') pendingSubmissions = s.count;
    if (s._id === 'rejected') rejectedSubmissions = s.count;
  });

  // Count total users
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });

  // Calculate total eco-points awarded using aggregation (OOM safe)
  const ecoPointsAggr = await User.aggregate([
    { $match: { 'gamification.ecoPoints': { $exists: true } } },
    { $group: { _id: null, total: { $sum: '$gamification.ecoPoints' } } }
  ]);
  const totalEcoPointsAwarded = ecoPointsAggr.length ? ecoPointsAggr[0].total : 0;

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        students: totalStudents,
        admins: totalUsers - totalStudents
      },
      submissions: {
        total: totalSubmissions,
        approved: approvedSubmissions,
        pending: pendingSubmissions,
        rejected: rejectedSubmissions
      },
      ecoPoints: {
        totalAwarded: totalEcoPointsAwarded,
        averagePerStudent: totalStudents > 0 ? Math.round(totalEcoPointsAwarded / totalStudents) : 0
      }
    }
  });
});

// @desc    Get aggregate impact report (grouped by District and School)
// @route   GET /api/admin/reports/impact
// @access  Private/Admin
exports.getImpactReport = asyncHandler(async (req, res, next) => {
  const impactStats = await User.aggregate([
    { $match: { role: 'student' } },
    {
      $group: {
        _id: { district: '$district', schoolId: '$schoolId', schoolName: '$school' },
        totalStudents: { $sum: 1 },
        totalEcoPoints: { $sum: '$gamification.ecoPoints' },
        totalTrees: { $sum: '$environmentalImpact.treesPlanted' },
        totalCo2: { $sum: '$environmentalImpact.co2Prevented' },
        totalWater: { $sum: '$environmentalImpact.waterSaved' },
        totalPlastic: { $sum: '$environmentalImpact.plasticReduced' },
        totalEnergy: { $sum: '$environmentalImpact.energySaved' },
        totalVerifiedActions: { $sum: '$environmentalImpact.activitiesCompleted' }
      }
    },
    {
      $sort: { '_id.district': 1, '_id.schoolName': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: impactStats.map(stat => ({
      district: stat._id.district || 'Unassigned',
      schoolName: stat._id.schoolName || 'Unassigned',
      schoolId: stat._id.schoolId,
      totalStudents: stat.totalStudents,
      totalEcoPoints: stat.totalEcoPoints,
      totalTrees: stat.totalTrees,
      totalCo2: stat.totalCo2,
      totalWater: stat.totalWater,
      totalPlastic: stat.totalPlastic,
      totalEnergy: stat.totalEnergy,
      totalVerifiedActions: stat.totalVerifiedActions
    }))
  });
});

// @desc    Get aggregate school stats
// @route   GET /api/admin/school/:schoolId/stats
// @access  Private/Admin
exports.getSchoolStats = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get aggregate district stats
// @route   GET /api/admin/district/:districtId/stats
// @access  Private/Admin
exports.getDistrictStats = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get aggregate state stats
// @route   GET /api/admin/state/:stateId/stats
// @access  Private/Admin
exports.getStateStats = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
});