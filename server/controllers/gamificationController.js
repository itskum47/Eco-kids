const { Badge, Level, CertificateTemplate, Leaderboard } = require('../models/Gamification');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');
const gamificationService = require('../services/gamificationService');
const { validationResult } = require('express-validator');
const badgeEngine = require('../utils/badgeEngine');
const levelEngine = require('../utils/levelEngine');
const { cacheService } = require('../services/cacheService');
const logger = require('../utils/logger');

// Get user's gamification profile for dashboard
exports.getMyGamificationProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('gamification');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextLevel = await Level.findOne({
      minPoints: { $gt: user.gamification.ecoPoints }
    }).sort({ minPoints: 1 });

    const progressPercent = nextLevel ?
      (user.gamification.ecoPoints / nextLevel.minPoints) * 100 : 100;

    res.json({
      success: true,
      data: {
        ecoPoints: user.gamification.ecoPoints,
        level: user.gamification.level,
        badges: user.gamification.badges,
        nextLevelPoints: nextLevel ? nextLevel.minPoints : null,
        progressPercent: Math.min(progressPercent, 100)
      }
    });
  } catch (error) {
    console.error('Get gamification profile error:', error);
    res.status(500).json({ message: 'Failed to fetch gamification profile' });
  }
};

// Get user's gamification data

exports.getUserGamificationData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('certificates.template')
      .select('gamification progress');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's current level info
    const currentLevel = await Level.findOne({ level: user.gamification.level });
    const nextLevel = await Level.findOne({ level: user.gamification.level + 1 });

    // Get recent activities
    const recentPoints = user.pointsHistory
      .sort((a, b) => b.earnedAt - a.earnedAt)
      .slice(0, 10);

    // Get user's rank
    const globalRank = await User.countDocuments({ 'gamification.ecoPoints': { $gt: user.gamification.ecoPoints } }) + 1;

    res.json({
      success: true,
      data: {
        points: user.gamification.ecoPoints,
        level: user.gamification.level,
        currentLevel,
        nextLevel,
        streaks: user.gamification.streak,
        badges: user.gamification.badges,
        certificates: user.progress.certificates,
        recentPoints,
        globalRank,
        progress: nextLevel ? {
          current: user.gamification.ecoPoints - currentLevel.minPoints,
          total: nextLevel.minPoints - currentLevel.minPoints,
          percentage: ((user.gamification.ecoPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
        } : null
      }
    });
  } catch (error) {
    console.error('Get user gamification data error:', error);
    res.status(500).json({ message: 'Failed to fetch gamification data' });
  }
};

// @desc    Get global leaderboard (students)
// @route   GET /api/gamification/leaderboard/global
// @access  Private
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const period = req.query.period || 'all-time';
    const limit = parseInt(req.query.limit) || 50;

    let rankings = [];

    // 1. Try fetching from Redis ZSET
    const zKey = 'leaderboards:global:zset';
    const redisResults = await cacheService.zrevrange(zKey, 0, limit - 1, true);

    if (redisResults && redisResults.length > 0) {
      logger.info(`[Cache Hit] Leaderboard ZSET served ${redisResults.length / 2} users.`);

      const userIds = [];
      const scoreMap = {};

      // Parse array [id1, score1, id2, score2]
      for (let i = 0; i < redisResults.length; i += 2) {
        const id = redisResults[i];
        const score = parseInt(redisResults[i + 1], 10);
        userIds.push(id);
        scoreMap[id] = score;
      }

      // Fetch user details from Mongo
      const users = await User.find({ _id: { $in: userIds } })
        .select('name profile.school profile.grade')
        .lean();

      // Ensure stable order from Redis ZSET ranking
      rankings = userIds.map((id, index) => {
        const user = users.find(u => u._id.toString() === id);
        return {
          rank: index + 1,
          user: user ? {
            id: user._id,
            name: user.name,
            school: user.profile?.school,
            grade: user.profile?.grade
          } : { id, name: "Unknown" },
          score: scoreMap[id],
          change: 0
        };
      });

    } else {
      logger.info(`[Cache Miss] Rebuilding Leaderboard ZSET from MongoDB.`);

      const students = await User.find({ role: 'student' })
        .select('name profile.school profile.grade gamification.ecoPoints')
        .sort({ 'gamification.ecoPoints': -1 })
        .limit(parseInt(limit))
        .lean();

      rankings = students.map((user, index) => {
        // Hydrate ZSET in background
        cacheService.zadd(zKey, user.gamification?.ecoPoints || 0, user._id.toString()).catch(err =>
          logger.error('[Redis ZADD Fallback Error]', err)
        );

        return {
          rank: index + 1,
          user: {
            id: user._id,
            name: user.name,
            school: user.profile?.school,
            grade: user.profile?.grade
          },
          score: user.gamification?.ecoPoints || 0,
          change: 0
        };
      });
    }

    // Add user's position if authenticated
    let userPosition = null;
    if (req.user) {
      // Use ZREVRANK to get O(log(N)) user rank
      const rankIndex = await cacheService.zrevrank(zKey, req.user.id.toString());

      if (rankIndex !== null) {
        const user = await User.findById(req.user.id).select('gamification');
        userPosition = {
          rank: rankIndex + 1,
          score: user?.gamification?.ecoPoints || 0,
          change: 0
        };
      }
    }

    const responsePayload = {
      success: true,
      data: {
        leaderboard: {
          type: 'global',
          timeframe: period,
          category: 'eco-points',
          lastUpdated: new Date(),
          rankings: rankings
        },
        userPosition
      }
    };

    res.json(responsePayload);
  } catch (error) {
    console.error('Get leaderboards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboards'
    });
  }
};

// Get all badges
exports.getBadges = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const badges = await Badge.find(filter).sort({ rarity: 1, points: 1 });

    // If user is authenticated, mark which badges they have
    let userBadges = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select('gamification');
      if (user && user.gamification && user.gamification.badges) {
        userBadges = user.gamification.badges.map(b => b.badgeId);
      }
    }

    const badgesWithStatus = badges.map(badge => ({
      ...badge.toObject(),
      earned: userBadges.includes(badge._id.toString())
    }));

    res.json({
      success: true,
      data: badgesWithStatus
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
};

// Get levels
exports.getLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ level: 1 });

    // Add user progress if authenticated
    let userLevel = null;
    if (req.user) {
      const user = await User.findById(req.user.id).select('gamification');
      userLevel = user.gamification.level;
    }

    const levelsWithProgress = levels.map(level => ({
      ...level.toObject(),
      unlocked: userLevel ? level.level <= userLevel : false,
      current: userLevel === level.level
    }));

    res.json({
      success: true,
      data: levelsWithProgress
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ message: 'Failed to fetch levels' });
  }
};

// Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, data } = req.body;
    const userId = req.user.id;

    const result = await gamificationService.generateCertificate(userId, templateId, data);

    // In a real application, you would upload the PDF to cloud storage
    // For now, we'll just return success

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        certificateId: result.certificate.data.certificateId,
        issuedAt: result.certificate.issuedAt
      }
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get user certificates
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('certificates.template', 'name type')
      .select('certificates');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.certificates.sort((a, b) => b.issuedAt - a.issuedAt)
    });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

// Award points manually (admin only)
exports.awardPoints = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, points, description } = req.body;

    const result = await gamificationService.awardPoints(
      userId,
      points,
      'manual',
      description || 'Manual points award'
    );

    res.json({
      success: true,
      message: 'Points awarded successfully',
      data: result
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Check for new achievements
exports.checkAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update streak
    await gamificationService.updateUserStreak(userId);

    // Check for new badges
    const newBadges = await gamificationService.checkBadgeEligibility(userId);

    // Check for level up
    const levelResult = await gamificationService.checkLevelUp(userId);

    res.json({
      success: true,
      data: {
        newBadges,
        levelUp: levelResult.levelUp,
        newLevel: levelResult.newLevel,
        bonusPoints: levelResult.bonusPoints
      }
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Failed to check achievements' });
  }
};

// Get achievement statistics
exports.getAchievementStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Badge.countDocuments({ isActive: true }),
      Level.countDocuments(),
      User.aggregate([
        { $group: { _id: null, avgLevel: { $avg: '$gamification.level' }, maxPoints: { $max: '$gamification.ecoPoints' } } }
      ]),
      User.countDocuments({ 'gamification.badges.0': { $exists: true } }),
      User.countDocuments({ 'progress.certificates.0': { $exists: true } })
    ]);

    const [
      totalBadges,
      totalLevels,
      userStats,
      usersWithBadges,
      usersWithCertificates
    ] = stats;

    res.json({
      success: true,
      data: {
        totalBadges,
        totalLevels,
        averageLevel: Math.round(userStats[0]?.avgLevel || 0),
        highestPoints: userStats[0]?.maxPoints || 0,
        usersWithBadges,
        usersWithCertificates
      }
    });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    res.status(500).json({ message: 'Failed to fetch achievement statistics' });
  }
};

// Admin: Create badge
exports.createBadge = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const badge = new Badge(req.body);
    await badge.save();

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: badge
    });
  } catch (error) {
    console.error('Create badge error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Badge name already exists' });
    }
    res.status(500).json({ message: 'Failed to create badge' });
  }
};

// Admin: Update badge
exports.updateBadge = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const badge = await Badge.findByIdAndUpdate(id, req.body, { new: true });

    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    res.json({
      success: true,
      message: 'Badge updated successfully',
      data: badge
    });
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ message: 'Failed to update badge' });
  }
};

// Admin: Delete badge
exports.deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const badge = await Badge.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    res.json({
      success: true,
      message: 'Badge deactivated successfully'
    });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ message: 'Failed to delete badge' });
  }
};