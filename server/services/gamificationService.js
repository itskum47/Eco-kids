const { Badge, Level, CertificateTemplate, Leaderboard } = require('../models/Gamification');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Game = require('../models/Game');
const Experiment = require('../models/Experiment');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const Notification = require('../models/Notification');
const ActivitySubmission = require('../models/ActivitySubmission');
const { gamificationQueue } = require('../queues/gamificationQueue');

const APPROVED_ACTIVITY_STATUSES = ['teacher_approved', 'approved'];

class GamificationService {
  // Badge Management
  async awardBadge(userId, badgeId, context = {}) {
    try {
      const user = await User.findById(userId);
      const badge = await Badge.findById(badgeId);

      if (!user || !badge) {
        throw new Error('User or badge not found');
      }

      // Check if user already has this badge
      const existingBadge = user.badges.find(b => b.badge.toString() === badgeId);
      if (existingBadge) {
        return { success: false, message: 'Badge already awarded' };
      }

      // Award badge
      user.badges.push({
        badge: badgeId,
        awardedAt: new Date(),
        context
      });

      // Award points if badge has points
      if (badge.points > 0) {
        user.gamification.ecoPoints += badge.points;
        // Transaction is created in awardPoints method
      }

      await user.save();

      return {
        success: true,
        badge,
        pointsAwarded: badge.points
      };
    } catch (error) {
      throw new Error(`Failed to award badge: ${error.message}`);
    }
  }

  async checkBadgeEligibility(userId) {
    try {
      const user = await User.findById(userId).populate('badges.badge');
      const badges = await Badge.find({ isActive: true });
      const newBadges = [];

      for (const badge of badges) {
        // Skip if user already has this badge
        if (user.badges.find(b => b.badge._id.toString() === badge._id.toString())) {
          continue;
        }

        const isEligible = await this.checkSingleBadgeEligibility(user, badge);
        if (isEligible) {
          const result = await this.awardBadge(userId, badge._id);
          if (result.success) {
            newBadges.push(result.badge);
          }
        }
      }

      return newBadges;
    } catch (error) {
      throw new Error(`Failed to check badge eligibility: ${error.message}`);
    }
  }

  async checkSingleBadgeEligibility(user, badge) {
    const { criteria } = badge;
    const now = new Date();

    switch (criteria.type) {
      case 'points':
        return (user.gamification?.ecoPoints || 0) >= criteria.value;

      case 'quizzes':
        const quizCount = await this.getUserActivityCount(user._id, 'quiz', criteria.timeframe);
        return quizCount >= criteria.value;

      case 'games':
        const gameCount = await this.getUserActivityCount(user._id, 'game', criteria.timeframe);
        return gameCount >= criteria.value;

      case 'experiments':
        const expCount = await this.getUserActivityCount(user._id, 'experiment', criteria.timeframe);
        return expCount >= criteria.value;

      case 'streak':
        return user.streaks.current >= criteria.value;

      default:
        return false;
    }
  }

  async getUserActivityCount(userId, type, timeframe) {
    const timeFilter = this.getTimeFilter(timeframe);

    switch (type) {
      case 'quiz':
        return await Quiz.countDocuments({
          'attempts.user': userId,
          'attempts.completedAt': timeFilter,
          'attempts.score.percentage': { $gte: 60 } // Only count passed quizzes
        });

      case 'game':
        return await Game.countDocuments({
          'attempts.user': userId,
          'attempts.completedAt': timeFilter
        });

      case 'experiment':
        return await Experiment.countDocuments({
          'submissions.user': userId,
          'submissions.submittedAt': timeFilter,
          'submissions.status': 'approved'
        });

      default:
        return 0;
    }
  }

  getTimeFilter(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return { $gte: weekStart };
      case 'monthly':
        return { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      default:
        return {}; // all-time
    }
  }

  // Level Management
  async checkLevelUp(userId) {
    try {
      const user = await User.findById(userId);
      const levels = await Level.find().sort({ level: 1 });

      const currentLevel = levels.find(l =>
        (user.gamification?.ecoPoints || 0) >= l.minPoints && (user.gamification?.ecoPoints || 0) <= l.maxPoints
      );

      if (currentLevel && currentLevel.level > (user.gamification?.level || 1)) {
        user.gamification.level = currentLevel.level;
        if (!user.gamification.levelHistory) user.gamification.levelHistory = [];
        user.gamification.levelHistory.push({
          level: currentLevel.level,
          achievedAt: new Date(),
          pointsAtAchievement: user.gamification.ecoPoints
        });

        // Award level-up points
        const levelUpPoints = currentLevel.level * 10;
        user.gamification.ecoPoints += levelUpPoints;

        await user.save();

        return {
          levelUp: true,
          newLevel: currentLevel,
          bonusPoints: levelUpPoints
        };
      }

      return { levelUp: false };
    } catch (error) {
      throw new Error(`Failed to check level up: ${error.message}`);
    }
  }

  // Leaderboard Management
  async updateLeaderboards() {
    try {
      const leaderboardTypes = [
        { type: 'global', timeframe: 'weekly', category: 'points' },
        { type: 'global', timeframe: 'monthly', category: 'points' },
        { type: 'global', timeframe: 'all-time', category: 'points' },
        { type: 'school', timeframe: 'weekly', category: 'points' },
        { type: 'region', timeframe: 'weekly', category: 'points' }
      ];

      for (const config of leaderboardTypes) {
        await this.updateSingleLeaderboard(config);
      }
    } catch (error) {
      throw new Error(`Failed to update leaderboards: ${error.message}`);
    }
  }

  async updateSingleLeaderboard({ type, timeframe, category, scope = {} }) {
    try {
      const timeFilter = this.getTimeFilter(timeframe);
      let userFilter = {};

      // Apply scope filters
      if (type === 'school' && scope.schoolId) {
        userFilter.school = scope.schoolId;
      } else if (type === 'region' && scope.region) {
        userFilter.region = scope.region;
      }

      // Get user rankings based on category
      let users;
      if (category === 'points') {
        users = await User.find(userFilter)
          .select('name profile.avatar gamification.ecoPoints school region profile.grade')
          .sort({ 'gamification.ecoPoints': -1 })
          .limit(100);
      }

      const gradeWeightFactor = {
        '1': 2.0, '2': 1.9, '3': 1.8, '4': 1.7, '5': 1.6,
        '6': 1.5, '7': 1.4, '8': 1.3, '9': 1.2, '10': 1.1,
        '11': 1.0, '12': 1.0
      };

      // Prepare rankings
      let rankings = users.map((userData) => {
        const grade = userData.profile?.grade || '12';
        const weight = gradeWeightFactor[grade] || 1.0;
        const rawScore = userData.gamification?.ecoPoints || 0;
        const normalizedScore = Math.floor(rawScore * weight);

        return {
          user: userData._id,
          score: normalizedScore,
          rawScore,
          change: 0 // Calculate change from previous ranking
        }
      });

      rankings.sort((a, b) => b.score - a.score);
      rankings = rankings.map((ranking, index) => ({
        ...ranking,
        rank: index + 1
      }));

      // Update or create leaderboard
      await Leaderboard.findOneAndUpdate(
        { type, timeframe, category, ...scope },
        {
          rankings,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update leaderboard: ${error.message}`);
    }
  }

  // Certificate Generation
  async generateCertificate(userId, templateId, data = {}) {
    try {
      const user = await User.findById(userId);
      const template = await CertificateTemplate.findById(templateId);

      if (!user || !template) {
        throw new Error('User or template not found');
      }

      // Check if user meets requirements
      const meetsRequirements = await this.checkCertificateRequirements(user, template.requirements);
      if (!meetsRequirements) {
        throw new Error('User does not meet certificate requirements');
      }

      // Generate certificate HTML
      const certificateHtml = await this.renderCertificateTemplate(template, user, data);

      // Generate PDF using puppeteer
      const pdfBuffer = await this.generateCertificatePdf(certificateHtml);

      // Save certificate to user
      const certificate = {
        template: templateId,
        issuedAt: new Date(),
        data: {
          ...data,
          certificateId: `ECOKIDS-${Date.now()}-${user._id.toString().slice(-6).toUpperCase()}`
        },
        pdfUrl: null // Will be set after upload to cloud storage
      };

      user.certificates.push(certificate);
      await user.save();

      return {
        certificate,
        pdfBuffer,
        filename: `certificate-${certificate.data.certificateId}.pdf`
      };
    } catch (error) {
      throw new Error(`Failed to generate certificate: ${error.message}`);
    }
  }

  async checkCertificateRequirements(user, requirements) {
    if (requirements.minScore && user.averageQuizScore < requirements.minScore) {
      return false;
    }

    if (requirements.level && user.level < requirements.level) {
      return false;
    }

    if (requirements.badges && requirements.badges.length > 0) {
      const userBadgeNames = user.badges.map(b => b.badge.name);
      const hasAllBadges = requirements.badges.every(badge => userBadgeNames.includes(badge));
      if (!hasAllBadges) return false;
    }

    return true;
  }

  async renderCertificateTemplate(template, user, data) {
    let html = template.template;

    // Replace template variables
    const variables = {
      '{{userName}}': `${user.firstName} ${user.lastName}`,
      '{{userLevel}}': user.gamification?.level || 1,
      '{{ecoPoints}}': user.gamification?.ecoPoints || 0,
      '{{issueDate}}': new Date().toLocaleDateString('en-IN'),
      '{{certificateId}}': data.certificateId || 'TEMP-ID',
      ...data
    };

    Object.entries(variables).forEach(([key, value]) => {
      html = html.replace(new RegExp(key, 'g'), value);
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>${template.style}</style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  }

  async generateCertificatePdf(html) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  // Streak Management
  async updateUserStreak(userId) {
    try {
      const user = await User.findById(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastActivity = user.streaks.lastActivity;

      if (!lastActivity) {
        // First activity
        user.streaks.current = 1;
        user.streaks.longest = Math.max(user.streaks.longest, 1);
        user.streaks.lastActivity = today;
      } else {
        const lastActivityDate = new Date(lastActivity);
        lastActivityDate.setHours(0, 0, 0, 0);

        if (lastActivityDate.getTime() === yesterday.getTime()) {
          // Consecutive day
          user.streaks.current += 1;
          user.streaks.longest = Math.max(user.streaks.longest, user.streaks.current);
          user.streaks.lastActivity = today;
        } else if (lastActivityDate.getTime() === today.getTime()) {
          // Same day, no change
          return user.streaks;
        } else {
          // Streak broken
          user.streaks.current = 1;
          user.streaks.lastActivity = today;
        }
      }

      await user.save();
      return user.streaks;
    } catch (error) {
      throw new Error(`Failed to update streak: ${error.message}`);
    }
  }

  // Points Management
  async awardPoints(userId, points, source, description, sourceId = null, activityType = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // ─────────────────────────────────────────────────────────
      // Check for active seasonal event bonus
      // ─────────────────────────────────────────────────────────
      let multiplier = 1.0;
      let eventBonus = 0;
      let eventId = null;

      if (activityType) {
        const SeasonalEvent = require('../models/SeasonalEvent');
        const now = new Date();
        const activeEvent = await SeasonalEvent.findOne({
          isActive: true,
          startsAt: { $lte: now },
          endsAt: { $gte: now },
          $or: [
            { eligibleActivityTypes: activityType },
            { eligibleActivityTypes: { $size: 0 } } // Empty = all types eligible
          ]
        }).lean();

        if (activeEvent) {
          multiplier = activeEvent.bonusMultiplier || 1.0;
          eventId = activeEvent._id;
        }
      }

      const basePoints = points;
      const finalPoints = Math.floor(basePoints * multiplier);
      eventBonus = finalPoints - basePoints;

      // Guard: Check if points would go negative
      const currentPoints = user.gamification?.ecoPoints || 0;
      if (currentPoints + finalPoints < 0) {
        throw new Error('Insufficient eco-points balance');
      }

      // Update user's gamification.ecoPoints
      user.gamification.ecoPoints = currentPoints + finalPoints;
      user.ecoCoins = Math.max(0, (user.ecoCoins || currentPoints) + finalPoints);
      await user.save();

      // Create transaction record (which triggers post-save hook to update ecoPointsTotal)
      const EcoPointsTransaction = require('../models/EcoPointsTransaction');
      await EcoPointsTransaction.create({
        userId,
        points: Math.abs(finalPoints),
        reason: description || source,
        sourceType: source,
        sourceId,
        sourceName: description,
        status: 'completed',
        metadata: {
          multiplier,
          eventId: eventId ? eventId.toString() : null,
          eventBonus: eventBonus > 0 ? eventBonus : null
        }
      });

      // Check for level up
      const levelResult = await this.checkLevelUp(userId);

      // Auto-trigger badge check after point award
      const gamificationQueue = require('../queues/gamificationQueue').queue;
      await gamificationQueue.add('check-badges', { userId: userId.toString() });

      return {
        pointsAwarded: finalPoints,
        basePoints: basePoints,
        multiplier: multiplier > 1 ? multiplier : undefined,
        eventBonus: eventBonus > 0 ? eventBonus : undefined,
        totalPoints: user.gamification.ecoPoints,
        levelUp: levelResult.levelUp,
        newLevel: levelResult.newLevel,
        newBadges: []
      };
    } catch (error) {
      throw new Error(`Failed to award points: ${error.message}`);
    }
  }

  async evaluateBadgesForUser(userId) {
    const user = await User.findById(userId)
      .select('gamification profile environmentalImpact progress')
      .lean();

    if (!user) return;

    const earnedBadgeIds = (user.gamification?.badges || []).map(b => b.badgeId.toString());
    const allBadges = await Badge.find({ isActive: true }).lean();
    const newlyUnlocked = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge._id.toString())) continue;

      const unlocked = await this.checkBadgeCondition(user, badge);
      if (unlocked) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            'gamification.badges': {
              badgeId: badge._id,
              name: badge.name,
              earnedAt: new Date(),
              idempotencyKey: `badge_${badge._id}_${userId}`
            }
          }
        });
        newlyUnlocked.push(badge);

        // Create in-app notification
        await Notification.create({
          userId,
          type: 'badge',
          title: `Badge Unlocked: ${badge.name}`,
          message: badge.description,
          data: { badgeId: badge._id, rarity: badge.rarity }
        });
      }
    }

    return newlyUnlocked;
  }

  async checkBadgeCondition(user, badge) {
    const criteria = badge.criteria || {};
    const type = criteria.type;
    const value = Number(criteria.value || 0);

    if (type === 'points') {
      return (user.gamification?.ecoPoints || 0) >= value;
    }

    if (type === 'streak') {
      return (user.gamification?.streak?.longest || 0) >= value;
    }

    if (type === 'quizzes') {
      return (user.progress?.quizzesTaken?.length || 0) >= value;
    }

    if (type === 'games') {
      return (user.progress?.gamesPlayed?.length || 0) >= value;
    }

    if (type === 'experiments') {
      return (user.progress?.experimentsCompleted?.length || 0) >= value;
    }

    if (type === 'water_saved') {
      return (user.environmentalImpact?.waterSaved || 0) >= value;
    }

    if (type === 'plastic_reduced') {
      return (user.environmentalImpact?.plasticReduced || 0) >= value;
    }

    if (type === 'trees_planted') {
      return (user.environmentalImpact?.treesPlanted || 0) >= value;
    }

    if (type === 'quiz_mastery') {
      const quizzes = user.progress?.quizzesTaken || [];
      if (quizzes.length < value) return false;
      const average = quizzes.reduce((sum, q) => sum + Number(q.score || 0), 0) / quizzes.length;
      return average >= Number(criteria.minAverageScore || 0);
    }

    if (type === 'activities_count' || type === 'cleanup_events') {
      const count = await this.countApprovedActivities(user._id, criteria);
      return count >= value;
    }

    if (type === 'active_days') {
      const activeDays = await this.countActiveDays(user._id, Number(criteria.windowDays || value));
      return activeDays >= value;
    }

    if (type === 'seasonal_activity') {
      const count = await this.countSeasonalActivities(user._id, criteria);
      return count >= value;
    }

    if (type === 'class_rank') {
      const rank = await this.getClassRank(user);
      return rank > 0 && rank <= value;
    }

    return false;
  }

  async countApprovedActivities(userId, criteria = {}) {
    const query = {
      user: userId,
      status: { $in: APPROVED_ACTIVITY_STATUSES }
    };

    if (Array.isArray(criteria.activityTypes) && criteria.activityTypes.length > 0) {
      query.activityType = { $in: criteria.activityTypes };
    }

    if (criteria.windowDays) {
      const since = new Date(Date.now() - Number(criteria.windowDays) * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: since };
    }

    return ActivitySubmission.countDocuments(query);
  }

  async countActiveDays(userId, windowDays) {
    const since = new Date(Date.now() - Number(windowDays || 7) * 24 * 60 * 60 * 1000);
    const rows = await ActivitySubmission.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: APPROVED_ACTIVITY_STATUSES },
          createdAt: { $gte: since }
        }
      },
      {
        $project: {
          dateOnly: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          }
        }
      },
      { $group: { _id: '$dateOnly' } },
      { $count: 'total' }
    ]);

    return rows[0]?.total || 0;
  }

  async countSeasonalActivities(userId, criteria = {}) {
    const query = {
      user: userId,
      status: { $in: APPROVED_ACTIVITY_STATUSES }
    };

    if (Array.isArray(criteria.activityTypes) && criteria.activityTypes.length > 0) {
      query.activityType = { $in: criteria.activityTypes };
    }

    const docs = await ActivitySubmission.find(query).select('createdAt').lean();
    const months = new Set((criteria.seasonMonths || []).map(Number));
    if (!months.size) return 0;

    return docs.filter((doc) => months.has(new Date(doc.createdAt).getUTCMonth() + 1)).length;
  }

  async getClassRank(user) {
    const schoolId = user.profile?.schoolId;
    const grade = String(user.profile?.grade || '').trim();
    if (!schoolId || !grade) return -1;

    const classmates = await User.find({
      role: 'student',
      'profile.schoolId': schoolId,
      'profile.grade': grade,
      isActive: true
    })
      .select('_id gamification.ecoPoints')
      .sort({ 'gamification.ecoPoints': -1, _id: 1 })
      .lean();

    const idx = classmates.findIndex((student) => String(student._id) === String(user._id));
    return idx === -1 ? -1 : idx + 1;
  }
}

module.exports = new GamificationService();