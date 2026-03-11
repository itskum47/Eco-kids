const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  titleHi: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  descriptionHi: {
    type: String
  },
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['quiz', 'experiment', 'game', 'topic', 'general', 'milestone'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'special'],
    default: 'bronze'
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  criteria: {
    // Conditions that were met to earn this achievement
    type: {
      type: String, // e.g., 'quiz_score', 'completion_count', 'streak', 'time_based'
      required: true
    },
    value: {
      type: Number, // The value achieved (e.g., score of 95, completed 10 items)
      required: true
    },
    threshold: {
      type: Number, // The threshold that needed to be met
      required: true
    },
    additionalData: mongoose.Schema.Types.Mixed // Any additional context
  },
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    },
    isComplete: {
      type: Boolean,
      default: false
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  shareableMessage: {
    type: String
  },
  relatedContent: {
    topics: [{ type: mongoose.Schema.ObjectId, ref: 'Topic' }],
    quizzes: [{ type: mongoose.Schema.ObjectId, ref: 'Quiz' }],
    games: [{ type: mongoose.Schema.ObjectId, ref: 'Game' }],
    experiments: [{ type: mongoose.Schema.ObjectId, ref: 'Experiment' }]
  }
}, {
  timestamps: true
});

// Index for better query performance
AchievementSchema.index({ userId: 1, earnedAt: -1 });
AchievementSchema.index({ userId: 1, category: 1 });
AchievementSchema.index({ achievementId: 1 });

// Virtual for formatted earned date
AchievementSchema.virtual('earnedDateFormatted').get(function() {
  return this.earnedAt.toLocaleDateString('en-IN');
});

// Method to check if achievement criteria is met
AchievementSchema.methods.checkCriteria = function(userStats) {
  const { type, threshold } = this.criteria;
  
  switch (type) {
    case 'quiz_score':
      return userStats.averageQuizScore >= threshold;
    case 'completion_count':
      return userStats.completedActivities >= threshold;
    case 'streak':
      return userStats.currentStreak >= threshold;
    case 'points':
      return userStats.totalPoints >= threshold;
    case 'time_spent':
      return userStats.totalTimeSpent >= threshold;
    default:
      return false;
  }
};

// Static method to check and award achievements for a user
AchievementSchema.statics.checkAndAwardAchievements = async function(userId, userStats) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) return [];
  
  // Define available achievements
  const availableAchievements = [
    {
      achievementId: 'first_quiz',
      title: 'Quiz Starter',
      titleHi: 'प्रश्नोत्तरी शुरुआतकर्ता',
      description: 'Complete your first quiz',
      descriptionHi: 'अपनी पहली प्रश्नोत्तरी पूरी करें',
      icon: '🎯',
      category: 'quiz',
      type: 'bronze',
      points: 50,
      rarity: 'common',
      criteria: { type: 'completion_count', value: 1, threshold: 1 }
    },
    {
      achievementId: 'quiz_master',
      title: 'Quiz Master',
      titleHi: 'प्रश्नोत्तरी मास्टर',
      description: 'Score 90%+ on 10 quizzes',
      descriptionHi: '10 प्रश्नोत्तरी में 90%+ स्कोर करें',
      icon: '🧠',
      category: 'quiz',
      type: 'gold',
      points: 500,
      rarity: 'rare',
      criteria: { type: 'quiz_mastery', value: userStats.highScoreQuizzes || 0, threshold: 10 }
    },
    {
      achievementId: 'eco_warrior',
      title: 'Eco Warrior',
      titleHi: 'पर्यावरण योद्धा',
      description: 'Complete 5 environmental experiments',
      descriptionHi: '5 पर्यावरणीय प्रयोग पूरे करें',
      icon: '🌱',
      category: 'experiment',
      type: 'silver',
      points: 300,
      rarity: 'uncommon',
      criteria: { type: 'experiment_count', value: userStats.experimentsCompleted || 0, threshold: 5 }
    },
    {
      achievementId: 'points_collector',
      title: 'Points Collector',
      titleHi: 'अंक संग्राहक',
      description: 'Earn 1000 total points',
      descriptionHi: 'कुल 1000 अंक अर्जित करें',
      icon: '💎',
      category: 'milestone',
      type: 'gold',
      points: 200,
      rarity: 'uncommon',
      criteria: { type: 'points', value: userStats.totalPoints || 0, threshold: 1000 }
    },
    {
      achievementId: 'knowledge_seeker',
      title: 'Knowledge Seeker',
      titleHi: 'ज्ञान खोजी',
      description: 'Complete 50 activities',
      descriptionHi: '50 गतिविधियां पूरी करें',
      icon: '📚',
      category: 'general',
      type: 'platinum',
      points: 750,
      rarity: 'epic',
      criteria: { type: 'completion_count', value: userStats.completedActivities || 0, threshold: 50 }
    }
  ];
  
  const newAchievements = [];
  
  // Check existing achievements for this user
  const existingAchievements = await this.find({ userId }).distinct('achievementId');
  
  for (const achievement of availableAchievements) {
    // Skip if already earned
    if (existingAchievements.includes(achievement.achievementId)) {
      continue;
    }
    
    // Check if criteria is met
    const criteriaMet = this.checkCriteriaStatic(achievement.criteria, userStats);
    
    if (criteriaMet) {
      const newAchievement = new this({
        userId,
        ...achievement,
        progress: {
          current: achievement.criteria.value,
          target: achievement.criteria.threshold,
          isComplete: true
        }
      });
      
      await newAchievement.save();
      newAchievements.push(newAchievement);
      
      // Award points to user
      user.totalPoints += achievement.points;
    }
  }
  
  if (newAchievements.length > 0) {
    await user.save();
  }
  
  return newAchievements;
};

// Static method to check criteria
AchievementSchema.statics.checkCriteriaStatic = function(criteria, userStats) {
  const { type, threshold } = criteria;
  
  switch (type) {
    case 'quiz_score':
      return (userStats.averageQuizScore || 0) >= threshold;
    case 'completion_count':
      return (userStats.completedActivities || 0) >= threshold;
    case 'experiment_count':
      return (userStats.experimentsCompleted || 0) >= threshold;
    case 'quiz_mastery':
      return (userStats.highScoreQuizzes || 0) >= threshold;
    case 'streak':
      return (userStats.currentStreak || 0) >= threshold;
    case 'points':
      return (userStats.totalPoints || 0) >= threshold;
    case 'time_spent':
      return (userStats.totalTimeSpent || 0) >= threshold;
    default:
      return false;
  }
};

// Static method to get achievement leaderboard
AchievementSchema.statics.getLeaderboard = async function(options = {}) {
  const { limit = 50, category, timeframe = 'all' } = options;
  
  let matchStage = {};
  
  if (category) {
    matchStage.category = category;
  }
  
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }
    
    matchStage.earnedAt = { $gte: startDate };
  }
  
  const leaderboard = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$userId',
        totalAchievements: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        categories: { $addToSet: '$category' },
        latestAchievement: { $max: '$earnedAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        name: '$user.name',
        school: '$user.school',
        totalAchievements: 1,
        totalPoints: 1,
        categories: 1,
        latestAchievement: 1
      }
    },
    { $sort: { totalAchievements: -1, totalPoints: -1 } },
    { $limit: limit }
  ]);
  
  return leaderboard;
};

module.exports = mongoose.model('Achievement', AchievementSchema);