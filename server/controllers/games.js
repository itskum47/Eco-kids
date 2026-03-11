const Game = require('../models/Game');
const Progress = require('../models/Progress');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all games
// @route   GET /api/v1/games
// @access  Public
exports.getGames = asyncHandler(async (req, res, next) => {
  const { 
    category, 
    difficulty, 
    ageGroup, 
    search, 
    page = 1, 
    limit = 12,
    sort = '-createdAt'
  } = req.query;
  
  let query = {};
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Filter by difficulty
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  // Filter by age group
  if (ageGroup) {
    query.ageGroup = { $regex: ageGroup, $options: 'i' };
  }
  
  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleHi: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const games = await Game.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await Game.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: games.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    data: games
  });
});

// @desc    Get single game
// @route   GET /api/v1/games/:id
// @access  Public
exports.getGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  
  // If user is authenticated, get their progress for this game
  let userProgress = null;
  if (req.user) {
    userProgress = await Progress.findOne({
      userId: req.user.id,
      gameId: req.params.id
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      game,
      userProgress
    }
  });
});

// @desc    Get game by slug
// @route   GET /api/v1/games/slug/:slug
// @access  Public
exports.getGameBySlug = asyncHandler(async (req, res, next) => {
  const game = await Game.findOne({ slug: req.params.slug });
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with slug of ${req.params.slug}`, 404));
  }
  
  // If user is authenticated, get their progress for this game
  let userProgress = null;
  if (req.user) {
    userProgress = await Progress.findOne({
      userId: req.user.id,
      gameId: game._id
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      game,
      userProgress
    }
  });
});

// @desc    Start/Resume game
// @route   POST /api/v1/games/:id/start
// @access  Private
exports.startGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  
  // Find or create progress record
  let progress = await Progress.findOne({
    userId: req.user.id,
    gameId: req.params.id
  });
  
  if (!progress) {
    progress = await Progress.create({
      userId: req.user.id,
      gameId: req.params.id,
      status: 'in_progress',
      progress: 0,
      data: {
        gameProgress: {
          level: 1,
          achievements: [],
          highScore: 0,
          unlockedFeatures: []
        }
      }
    });
  } else if (progress.status === 'not_started') {
    progress.status = 'in_progress';
    progress.lastAttemptAt = new Date();
    await progress.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Game started successfully',
    data: {
      game,
      progress
    }
  });
});

// @desc    Update game progress
// @route   PUT /api/v1/games/:id/progress
// @access  Private
exports.updateGameProgress = asyncHandler(async (req, res, next) => {
  const { level, score, achievements, timeSpent, gameData } = req.body;
  
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  
  let progress = await Progress.findOne({
    userId: req.user.id,
    gameId: req.params.id
  });
  
  if (!progress) {
    return next(new ErrorResponse('Game progress not found. Please start the game first.', 404));
  }
  
  // Update progress data
  if (level !== undefined) {
    progress.data.gameProgress.level = Math.max(progress.data.gameProgress.level, level);
  }
  
  if (score !== undefined) {
    progress.score = score;
    progress.data.gameProgress.highScore = Math.max(progress.data.gameProgress.highScore, score);
  }
  
  if (achievements && achievements.length > 0) {
    const newAchievements = achievements.filter(
      achievement => !progress.data.gameProgress.achievements.includes(achievement)
    );
    progress.data.gameProgress.achievements.push(...newAchievements);
  }
  
  if (timeSpent !== undefined) {
    progress.timeSpent += timeSpent;
  }
  
  if (gameData) {
    progress.data.gameProgress = { ...progress.data.gameProgress, ...gameData };
  }
  
  // Update overall progress based on level completion
  const maxLevel = game.challenges ? game.challenges.length : 10;
  progress.progress = Math.min(100, (progress.data.gameProgress.level / maxLevel) * 100);
  
  // Check if game is completed
  if (progress.progress >= 100) {
    progress.status = 'completed';
    progress.completedAt = new Date();
  }
  
  progress.lastAttemptAt = new Date();
  await progress.save();
  
  res.status(200).json({
    success: true,
    message: 'Game progress updated successfully',
    data: progress
  });
});

// @desc    Submit game score
// @route   POST /api/v1/games/:id/score
// @access  Private
exports.submitGameScore = asyncHandler(async (req, res, next) => {
  const { score, level, timeSpent, gameData } = req.body;
  
  if (!score && score !== 0) {
    return next(new ErrorResponse('Please provide a score', 400));
  }
  
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  
  let progress = await Progress.findOne({
    userId: req.user.id,
    gameId: req.params.id
  });
  
  if (!progress) {
    // Create new progress if it doesn't exist
    progress = await Progress.create({
      userId: req.user.id,
      gameId: req.params.id,
      status: 'completed',
      progress: 100,
      score,
      bestScore: score,
      timeSpent: timeSpent || 0,
      completedAt: new Date(),
      data: {
        gameProgress: {
          level: level || 1,
          achievements: [],
          highScore: score,
          unlockedFeatures: []
        }
      }
    });
  } else {
    // Update existing progress
    progress.attempts += 1;
    progress.score = score;
    progress.bestScore = Math.max(progress.bestScore, score);
    progress.lastAttemptAt = new Date();
    
    if (timeSpent) {
      progress.timeSpent += timeSpent;
    }
    
    if (level) {
      progress.data.gameProgress.level = Math.max(progress.data.gameProgress.level, level);
    }
    
    if (gameData) {
      progress.data.gameProgress = { ...progress.data.gameProgress, ...gameData };
    }
    
    await progress.save();
  }
  
  // Update user's total points and stats
  const User = require('../models/User');
  const user = await User.findById(req.user.id);
  
  if (user) {
    // Award points based on score (you can customize this logic)
    const pointsEarned = Math.floor(score / 10);
    user.totalPoints += pointsEarned;
    
    // Update game-related stats
    if (!user.stats) user.stats = {};
    if (!user.stats.gamesPlayed) user.stats.gamesPlayed = 0;
    user.stats.gamesPlayed += 1;
    
    await user.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Game score submitted successfully',
    data: {
      progress,
      pointsEarned: Math.floor(score / 10)
    }
  });
});

// @desc    Get game categories
// @route   GET /api/v1/games/categories
// @access  Public
exports.getGameCategories = asyncHandler(async (req, res, next) => {
  const categories = await Game.distinct('category');
  
  const categoryStats = await Promise.all(
    categories.map(async (category) => {
      const count = await Game.countDocuments({ category });
      return {
        category,
        count,
        displayName: category.charAt(0).toUpperCase() + category.slice(1)
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: categoryStats
  });
});

// @desc    Get popular games
// @route   GET /api/v1/games/popular
// @access  Public
exports.getPopularGames = asyncHandler(async (req, res, next) => {
  const { limit = 6 } = req.query;
  
  // Get games with most progress records (indicating popularity)
  const popularGames = await Progress.aggregate([
    { $match: { gameId: { $exists: true } } },
    { $group: { _id: '$gameId', playCount: { $sum: 1 } } },
    { $sort: { playCount: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'games',
        localField: '_id',
        foreignField: '_id',
        as: 'game'
      }
    },
    { $unwind: '$game' },
    {
      $project: {
        _id: '$game._id',
        title: '$game.title',
        titleHi: '$game.titleHi',
        slug: '$game.slug',
        category: '$game.category',
        difficulty: '$game.difficulty',
        duration: '$game.duration',
        description: '$game.description',
        playCount: 1
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    count: popularGames.length,
    data: popularGames
  });
});

// @desc    Create game (Admin only)
// @route   POST /api/v1/games
// @access  Private/Admin
exports.createGame = asyncHandler(async (req, res, next) => {
  const game = await Game.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Game created successfully',
    data: game
  });
});

// @desc    Update game (Admin only)
// @route   PUT /api/v1/games/:id
// @access  Private/Admin
exports.updateGame = asyncHandler(async (req, res, next) => {
  let game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  
  game = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Game updated successfully',
    data: game
  });
});

// @desc    Delete game (Admin only)
// @route   DELETE /api/v1/games/:id
// @access  Private/Admin
exports.deleteGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  
  // Delete associated progress records
  await Progress.deleteMany({ gameId: req.params.id });
  
  await game.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Game deleted successfully'
  });
});