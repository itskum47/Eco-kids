const User = require('../models/User');
const Progress = require('../models/Progress');
const Achievement = require('../models/Achievement');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search, role, grade } = req.query;

  let query = {};

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { school: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by grade
  if (grade) {
    query.grade = parseInt(grade);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized to view this profile
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return next(new ErrorResponse('Not authorized to access this user', 403));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check if user is authorized to update this profile
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this user', 403));
  }

  // Fields that can be updated by regular users
  const allowedFields = ['name', 'email', 'grade', 'school', 'city', 'state', 'preferredLanguage'];

  // Admin can update additional fields
  if (req.user.role === 'admin') {
    allowedFields.push('role', 'isActive');
  }

  // Filter req.body to only include allowed fields
  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Only admin can delete users
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete users', 403));
  }

  // Don't allow deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new ErrorResponse('Cannot delete the last admin user', 400));
    }
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user progress
// @route   GET /api/v1/users/:id/progress
// @access  Private
exports.getUserProgress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return next(new ErrorResponse('Not authorized to access this user progress', 403));
  }

  const progress = await Progress.find({ userId: req.params.id })
    .populate('topicId', 'title category difficulty')
    .populate('quizId', 'title category difficulty')
    .populate('gameId', 'title category difficulty')
    .populate('experimentId', 'title category difficulty')
    .sort({ updatedAt: -1 });

  // Calculate overall statistics
  const stats = {
    totalActivities: progress.length,
    completedActivities: progress.filter(p => p.status === 'completed').length,
    totalPoints: user.totalPoints || 0,
    currentLevel: user.level || 1,
    topicsCompleted: progress.filter(p => p.topicId && p.status === 'completed').length,
    quizzesCompleted: progress.filter(p => p.quizId && p.status === 'completed').length,
    gamesPlayed: progress.filter(p => p.gameId).length,
    experimentsCompleted: progress.filter(p => p.experimentId && p.status === 'completed').length
  };

  res.status(200).json({
    success: true,
    data: {
      progress,
      stats
    }
  });
});

// @desc    Get user achievements
// @route   GET /api/v1/users/:id/achievements
// @access  Private
exports.getUserAchievements = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check authorization
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return next(new ErrorResponse('Not authorized to access this user achievements', 403));
  }

  const achievements = await Achievement.find({ userId: req.params.id })
    .sort({ earnedAt: -1 });

  // Get available achievements that user hasn't earned yet
  const earnedAchievementIds = achievements.map(a => a.achievementId);

  res.status(200).json({
    success: true,
    data: {
      earned: achievements,
      total: achievements.length,
      recentAchievements: achievements.slice(0, 5) // Last 5 achievements
    }
  });
});

// @desc    Get leaderboard
// @route   GET /api/v1/users/leaderboard
// @access  Private
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const {
    timeframe = 'all', // all, month, week
    category = 'points', // points, quizzes, experiments, games
    grade,
    limit = 50
  } = req.query;

  let query = { role: 'student' };

  // Filter by grade if specified
  if (grade) {
    query.grade = parseInt(grade);
  }

  let sortField = 'totalPoints';

  // Determine sort field based on category
  switch (category) {
    case 'quizzes':
      sortField = 'stats.quizzesCompleted';
      break;
    case 'experiments':
      sortField = 'stats.experimentsCompleted';
      break;
    case 'games':
      sortField = 'stats.gamesPlayed';
      break;
    default:
      sortField = 'totalPoints';
  }

  const allUsers = await User.find(query)
    .select('name school city state totalPoints level stats createdAt _id')
    .sort({ [sortField]: -1, createdAt: 1 });

  // Add rank to each user
  const fullLeaderboard = allUsers.map((user, index) => ({
    ...user.toObject(),
    rank: index + 1
  }));

  let data = fullLeaderboard.slice(0, parseInt(limit));
  let neighbors = [];

  // If user ID is provided, find their exact neighbors
  if (req.user && req.user.id) {
    const userIndex = fullLeaderboard.findIndex(u => u._id.toString() === req.user.id.toString());
    if (userIndex !== -1) {
      // Get 2 neighbors above and 2 below
      const startIdx = Math.max(0, userIndex - 2);
      const endIdx = Math.min(fullLeaderboard.length, userIndex + 3);
      neighbors = fullLeaderboard.slice(startIdx, endIdx);
    }
  }

  res.status(200).json({
    success: true,
    count: data.length,
    data: data,
    neighbors: neighbors,
    filters: {
      timeframe,
      category,
      grade
    }
  });
});

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['student', 'teacher', 'admin'].includes(role)) {
    return next(new ErrorResponse('Please provide a valid role', 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Prevent demoting the last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new ErrorResponse('Cannot demote the last admin user', 400));
    }
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});