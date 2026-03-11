const EnvironmentalLesson = require('../models/EnvironmentalLesson');
const EcoPointsTransaction = require('../models/EcoPointsTransaction');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all environmental lessons
// @route   GET /api/environmental-lessons
// @access  Public
exports.getLessons = asyncHandler(async (req, res) => {
  const { category, difficulty, page = 1, limit = 10 } = req.query;

  const filter = { isPublished: true };

  if (category) {
    filter.category = category;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  const skip = (page - 1) * limit;

  const lessons = await EnvironmentalLesson.find(filter)
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EnvironmentalLesson.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: lessons.length,
    total,
    pages: Math.ceil(total / limit),
    data: lessons
  });
});

// @desc    Get single environmental lesson
// @route   GET /api/environmental-lessons/:id
// @access  Public
exports.getLesson = asyncHandler(async (req, res) => {
  const lesson = await EnvironmentalLesson.findById(req.params.id)
    .populate('createdBy', 'name role email')
    .populate({
      path: 'createdBy',
      select: 'name role'
    });

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Create environmental lesson
// @route   POST /api/environmental-lessons
// @access  Private (Teacher, Admin Only)
exports.createLesson = asyncHandler(async (req, res) => {
  const { title, description, category, ecoPointsReward, difficulty, content, objectives, tags } = req.body;

  // Validate required fields
  if (!title || !category) {
    return res.status(400).json({
      success: false,
      message: 'Title and category are required'
    });
  }

  const lesson = await EnvironmentalLesson.create({
    title,
    description,
    category,
    ecoPointsReward: ecoPointsReward || 50,
    difficulty: difficulty || 'easy',
    content,
    objectives,
    tags,
    createdBy: req.user.id,
    isPublished: false
  });

  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Update environmental lesson
// @route   PUT /api/environmental-lessons/:id
// @access  Private (Teacher, Admin Only)
exports.updateLesson = asyncHandler(async (req, res) => {
  let lesson = await EnvironmentalLesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check authorization - only creator or admin can update
  if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'state_admin' && req.user.role !== 'district_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this lesson'
    });
  }

  lesson = await EnvironmentalLesson.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Publish lesson
// @route   PATCH /api/environmental-lessons/:id/publish
// @access  Private (Admin Only)
exports.publishLesson = asyncHandler(async (req, res) => {
  const lesson = await EnvironmentalLesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  lesson.isPublished = true;
  await lesson.save();

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Delete environmental lesson
// @route   DELETE /api/environmental-lessons/:id
// @access  Private (Admin Only)
exports.deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await EnvironmentalLesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check authorization - only creator or admin can delete
  if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'state_admin' && req.user.role !== 'district_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this lesson'
    });
  }

  await EnvironmentalLesson.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Complete lesson and earn eco-points
// @route   POST /api/environmental-lessons/:id/complete
// @access  Private (Student)
exports.completeLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Find lesson
  const lesson = await EnvironmentalLesson.findById(id);

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if already completed
  const existingTransaction = await EcoPointsTransaction.findOne({
    userId,
    sourceType: 'lesson',
    sourceId: id,
    status: 'completed'
  });

  if (existingTransaction) {
    return res.status(400).json({
      success: false,
      message: 'You have already completed this lesson'
    });
  }

  // Create eco-points transaction
  const transaction = await EcoPointsTransaction.create({
    userId,
    points: lesson.ecoPointsReward,
    reason: `Completed lesson: ${lesson.title}`,
    sourceType: 'lesson',
    sourceId: id,
    sourceName: lesson.title,
    status: 'completed'
  });

  // Update user eco-points
  const user = await User.findById(userId);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { 
        ecoPointsTotal: lesson.ecoPointsReward,
        'gamification.ecoPoints': lesson.ecoPointsReward
      }
    },
    { new: true }
  );

  // Increment lesson completion count
  lesson.totalCompletions += 1;
  await lesson.save();

  res.status(200).json({
    success: true,
    message: `Congratulations! You earned ${lesson.ecoPointsReward} eco-points`,
    data: {
      transaction,
      userEcoPointsTotal: updatedUser.ecoPointsTotal,
      lessonTitle: lesson.title
    }
  });
});

// @desc    Get user's lesson completion status
// @route   GET /api/environmental-lessons/:id/status
// @access  Private
exports.getLessonStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const completion = await EcoPointsTransaction.findOne({
    userId,
    sourceType: 'lesson',
    sourceId: id,
    status: 'completed'
  });

  res.status(200).json({
    success: true,
    data: {
      completed: !!completion,
      completedAt: completion?.createdAt || null
    }
  });
});

// @desc    Get lessons by category
// @route   GET /api/environmental-lessons/category/:category
// @access  Public
exports.getLessonsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const lessons = await EnvironmentalLesson.find({
    category,
    isPublished: true
  })
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EnvironmentalLesson.countDocuments({
    category,
    isPublished: true
  });

  res.status(200).json({
    success: true,
    count: lessons.length,
    total,
    pages: Math.ceil(total / limit),
    data: lessons
  });
});
