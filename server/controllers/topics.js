const Topic = require('../models/Topic');
const { advancedPagination, successResponse, errorResponse, buildSearchQuery } = require('../utils/helpers');

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
exports.getTopics = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-publishedAt',
      category,
      difficulty,
      gradeLevel,
      search,
      status = 'published'
    } = req.query;

    // Build query
    let query = { status };

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (gradeLevel) {
      query.gradeLevel = { $in: [gradeLevel] };
    }

    // Add search functionality
    if (search) {
      const searchQuery = buildSearchQuery(search, ['title', 'description', 'content', 'tags']);
      query = { ...query, ...searchQuery };
    }

    const options = {
      page,
      limit,
      sort,
      populate: 'author relatedTopics',
      select: req.user ? '' : '-content' // Hide full content for non-authenticated users
    };

    const { results, pagination } = await advancedPagination(Topic, query, options);

    res.status(200).json({
      success: true,
      count: results.length,
      pagination,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single topic
// @route   GET /api/topics/:id
// @access  Public
exports.getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('author', 'name profile.avatar')
      .populate('relatedTopics', 'title slug category difficulty');

    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    // Check if topic is published or user has permission
    if (topic.status !== 'published' && (!req.user || req.user.role === 'student')) {
      return errorResponse(res, 403, 'Topic not available');
    }

    // Increment views
    await topic.incrementViews();

    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new topic
// @route   POST /api/topics
// @access  Private (Admin/Teacher)
exports.createTopic = async (req, res, next) => {
  try {
    // Add author to body
    req.body.author = req.user.id;

    // Set published date if status is published
    if (req.body.status === 'published') {
      req.body.publishedAt = new Date();
    }

    const topic = await Topic.create(req.body);

    await topic.populate('author', 'name profile.avatar');

    successResponse(res, 201, 'Topic created successfully', topic);
  } catch (error) {
    next(error);
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private (Admin/Teacher)
exports.updateTopic = async (req, res, next) => {
  try {
    let topic = await Topic.findById(req.params.id);

    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    // Check ownership (admin can edit all, teachers can edit only their own)
    if (req.user.role !== 'admin' && topic.author.toString() !== req.user.id) {
      return errorResponse(res, 403, 'Not authorized to update this topic');
    }

    // Set published date if status changed to published
    if (req.body.status === 'published' && topic.status !== 'published') {
      req.body.publishedAt = new Date();
    }

    // Update lastModifiedBy
    req.body.lastModifiedBy = req.user.id;

    topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author lastModifiedBy', 'name profile.avatar');

    successResponse(res, 200, 'Topic updated successfully', topic);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private (Admin only)
exports.deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    await topic.deleteOne();

    successResponse(res, 200, 'Topic deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get topics by category
// @route   GET /api/topics/category/:category
// @access  Public
exports.getTopicsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, sort = '-publishedAt' } = req.query;

    const query = { category, status: 'published' };
    const options = {
      page,
      limit,
      sort,
      populate: 'author',
      select: '-content'
    };

    const { results, pagination } = await advancedPagination(Topic, query, options);

    res.status(200).json({
      success: true,
      category,
      count: results.length,
      pagination,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular topics
// @route   GET /api/topics/popular
// @access  Public
exports.getPopularTopics = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topics = await Topic.getPopularTopics(parseInt(limit));

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search topics
// @route   GET /api/topics/search
// @access  Public
exports.searchTopics = async (req, res, next) => {
  try {
    const { query: searchTerm, page = 1, limit = 10 } = req.query;

    if (!searchTerm) {
      return errorResponse(res, 400, 'Search query is required');
    }

    const searchQuery = buildSearchQuery(searchTerm, ['title', 'description', 'tags']);
    const query = { ...searchQuery, status: 'published' };

    const options = {
      page,
      limit,
      sort: { score: { $meta: 'textScore' } },
      populate: 'author',
      select: '-content'
    };

    const { results, pagination } = await advancedPagination(Topic, query, options);

    res.status(200).json({
      success: true,
      searchTerm,
      count: results.length,
      pagination,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a topic
// @route   POST /api/topics/:id/like
// @access  Private
exports.likeTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    await topic.addLike();

    // Award points to user
    await req.user.addEcoPoints(1);

    successResponse(res, 200, 'Topic liked successfully', {
      likes: topic.likes,
      userPoints: req.user.gamification.ecoPoints + 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a topic
// @route   POST /api/topics/:id/complete
// @access  Private
exports.completeTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return errorResponse(res, 404, 'Topic not found');
    }

    // Check if user already completed this topic
    const alreadyCompleted = req.user.progress.topicsCompleted.some(
      completed => completed.topicId.toString() === topic._id.toString()
    );

    if (alreadyCompleted) {
      return errorResponse(res, 400, 'Topic already completed');
    }

    // Add to user's completed topics
    req.user.progress.topicsCompleted.push({
      topicId: topic._id,
      completedAt: new Date(),
      score: req.body.score || 100
    });

    // Award EcoPoints
    await req.user.addEcoPoints(topic.ecoPointsReward);

    // Update streak
    await req.user.updateStreak();

    // Mark completion on topic
    await topic.markCompletion();

    // Check for badges
    const completedCount = req.user.progress.topicsCompleted.length;
    if (completedCount === 1) {
      await req.user.awardBadge('first-topic', 'First Topic Completed');
    } else if (completedCount === 10) {
      await req.user.awardBadge('topic-explorer', 'Topic Explorer');
    } else if (completedCount === 50) {
      await req.user.awardBadge('topic-master', 'Topic Master');
    }

    await req.user.save();

    successResponse(res, 200, 'Topic completed successfully', {
      pointsEarned: topic.ecoPointsReward,
      totalPoints: req.user.gamification.ecoPoints,
      level: req.user.gamification.level,
      completedTopics: req.user.progress.topicsCompleted.length
    });
  } catch (error) {
    next(error);
  }
};