const Progress = require('../models/Progress');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user progress
// @route   GET /api/progress/me
// @access  Private
exports.getMyProgress = asyncHandler(async (req, res, next) => {
  let progress = await Progress.findOne({ user: req.user.id })
    .populate('completedTopics.topic', 'title slug category difficulty')
    .populate('completedExperiments.experiment', 'title slug category difficulty')
    .populate('completedGames.game', 'title slug category difficulty')
    .populate('quizAttempts.quiz', 'title category');

  if (!progress) {
    progress = await Progress.create({ user: req.user.id });
  }

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Update topic progress
// @route   PUT /api/progress/topic/:topicId
// @access  Private
exports.updateTopicProgress = asyncHandler(async (req, res, next) => {
  const { topicId } = req.params;
  const { completed, timeSpent, readingProgress } = req.body;

  let progress = await Progress.findOne({ user: req.user.id });
  
  if (!progress) {
    progress = await Progress.create({ user: req.user.id });
  }

  // Find existing topic progress
  const existingTopic = progress.completedTopics.find(
    item => item.topic.toString() === topicId
  );

  if (existingTopic) {
    existingTopic.timeSpent += timeSpent || 0;
    existingTopic.readingProgress = Math.max(existingTopic.readingProgress, readingProgress || 0);
    if (completed && !existingTopic.completed) {
      existingTopic.completed = true;
      existingTopic.completedAt = new Date();
    }
  } else {
    progress.completedTopics.push({
      topic: topicId,
      completed: completed || false,
      completedAt: completed ? new Date() : null,
      timeSpent: timeSpent || 0,
      readingProgress: readingProgress || 0
    });
  }

  // Update total stats
  progress.totalTimeSpent += timeSpent || 0;
  progress.lastActivity = new Date();

  await progress.save();

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Update experiment progress
// @route   PUT /api/progress/experiment/:experimentId
// @access  Private
exports.updateExperimentProgress = asyncHandler(async (req, res, next) => {
  const { experimentId } = req.params;
  const { completed, timeSpent, stepsCompleted } = req.body;

  let progress = await Progress.findOne({ user: req.user.id });
  
  if (!progress) {
    progress = await Progress.create({ user: req.user.id });
  }

  // Find existing experiment progress
  const existingExperiment = progress.completedExperiments.find(
    item => item.experiment.toString() === experimentId
  );

  if (existingExperiment) {
    existingExperiment.timeSpent += timeSpent || 0;
    existingExperiment.stepsCompleted = Math.max(existingExperiment.stepsCompleted, stepsCompleted || 0);
    if (completed && !existingExperiment.completed) {
      existingExperiment.completed = true;
      existingExperiment.completedAt = new Date();
    }
  } else {
    progress.completedExperiments.push({
      experiment: experimentId,
      completed: completed || false,
      completedAt: completed ? new Date() : null,
      timeSpent: timeSpent || 0,
      stepsCompleted: stepsCompleted || 0
    });
  }

  // Update total stats
  progress.totalTimeSpent += timeSpent || 0;
  progress.lastActivity = new Date();

  await progress.save();

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Update game progress
// @route   PUT /api/progress/game/:gameId
// @access  Private
exports.updateGameProgress = asyncHandler(async (req, res, next) => {
  const { gameId } = req.params;
  const { completed, timeSpent, score, level } = req.body;

  let progress = await Progress.findOne({ user: req.user.id });
  
  if (!progress) {
    progress = await Progress.create({ user: req.user.id });
  }

  // Find existing game progress
  const existingGame = progress.completedGames.find(
    item => item.game.toString() === gameId
  );

  if (existingGame) {
    existingGame.timeSpent += timeSpent || 0;
    existingGame.highScore = Math.max(existingGame.highScore, score || 0);
    existingGame.levelsCompleted = Math.max(existingGame.levelsCompleted, level || 0);
    existingGame.timesPlayed += 1;
    if (completed && !existingGame.completed) {
      existingGame.completed = true;
      existingGame.completedAt = new Date();
    }
  } else {
    progress.completedGames.push({
      game: gameId,
      completed: completed || false,
      completedAt: completed ? new Date() : null,
      timeSpent: timeSpent || 0,
      highScore: score || 0,
      levelsCompleted: level || 0,
      timesPlayed: 1
    });
  }

  // Update total stats
  progress.totalTimeSpent += timeSpent || 0;
  progress.lastActivity = new Date();

  await progress.save();

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Record quiz attempt
// @route   POST /api/progress/quiz/:quizId
// @access  Private
exports.recordQuizAttempt = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const { score, totalQuestions, answers, timeSpent } = req.body;

  let progress = await Progress.findOne({ user: req.user.id });
  
  if (!progress) {
    progress = await Progress.create({ user: req.user.id });
  }

  // Add quiz attempt
  progress.quizAttempts.push({
    quiz: quizId,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    answers,
    timeSpent: timeSpent || 0,
    attemptedAt: new Date()
  });

  // Update total stats
  progress.totalTimeSpent += timeSpent || 0;
  progress.lastActivity = new Date();

  await progress.save();

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Get learning analytics
// @route   GET /api/progress/analytics
// @access  Private
exports.getLearningAnalytics = asyncHandler(async (req, res, next) => {
  const progress = await Progress.findOne({ user: req.user.id });

  if (!progress) {
    return res.status(200).json({
      success: true,
      data: {
        totalTimeSpent: 0,
        topicsCompleted: 0,
        experimentsCompleted: 0,
        gamesCompleted: 0,
        averageQuizScore: 0,
        totalQuizAttempts: 0,
        learningStreak: 0,
        categoryProgress: []
      }
    });
  }

  // Calculate analytics
  const analytics = {
    totalTimeSpent: progress.totalTimeSpent,
    topicsCompleted: progress.completedTopics.filter(t => t.completed).length,
    experimentsCompleted: progress.completedExperiments.filter(e => e.completed).length,
    gamesCompleted: progress.completedGames.filter(g => g.completed).length,
    totalQuizAttempts: progress.quizAttempts.length,
    averageQuizScore: progress.quizAttempts.length > 0 
      ? progress.quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / progress.quizAttempts.length
      : 0,
    learningStreak: calculateLearningStreak(progress),
    categoryProgress: await calculateCategoryProgress(progress)
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// Helper function to calculate learning streak
const calculateLearningStreak = (progress) => {
  if (!progress.lastActivity) return 0;
  
  const today = new Date();
  const lastActivity = new Date(progress.lastActivity);
  const diffTime = Math.abs(today - lastActivity);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Simple streak calculation - can be enhanced
  return diffDays <= 1 ? progress.learningStreak || 1 : 0;
};

// Helper function to calculate category progress
const calculateCategoryProgress = async (progress) => {
  const categories = ['water', 'energy', 'biodiversity', 'climate', 'waste'];
  const categoryProgress = [];

  for (const category of categories) {
    const topicsInCategory = progress.completedTopics.filter(t => 
      t.topic && t.topic.category === category
    );
    const experimentsInCategory = progress.completedExperiments.filter(e => 
      e.experiment && e.experiment.category === category
    );
    
    categoryProgress.push({
      category,
      topicsCompleted: topicsInCategory.filter(t => t.completed).length,
      experimentsCompleted: experimentsInCategory.filter(e => e.completed).length,
      totalTimeSpent: [
        ...topicsInCategory,
        ...experimentsInCategory
      ].reduce((sum, item) => sum + item.timeSpent, 0)
    });
  }

  return categoryProgress;
};