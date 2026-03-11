const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  category: {
    type: String,
    enum: ['achievement', 'milestone', 'special', 'seasonal'],
    default: 'achievement'
  },
  criteria: {
    type: {
      type: String,
      enum: ['points', 'quizzes', 'games', 'experiments', 'streak', 'special'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all-time'],
      default: 'all-time'
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const levelSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  minPoints: {
    type: Number,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true
  },
  benefits: [{
    type: {
      type: String,
      enum: ['unlock_content', 'bonus_points', 'special_badge', 'early_access']
    },
    description: String,
    value: mongoose.Schema.Types.Mixed
  }],
  icon: String,
  color: {
    type: String,
    default: '#3B82F6'
  }
});

const certificateTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz_completion', 'topic_mastery', 'level_achievement', 'special_event'],
    required: true
  },
  template: {
    type: String, // HTML template
    required: true
  },
  style: {
    type: String, // CSS styles
    required: true
  },
  requirements: {
    minScore: {
      type: Number,
      default: 80
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic'
    },
    level: Number,
    badges: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['global', 'school', 'region', 'state', 'city'],
    required: true
  },
  scope: {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School'
    },
    region: String,
    state: String,
    city: String
  },
  timeframe: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'all-time'],
    required: true
  },
  category: {
    type: String,
    enum: ['points', 'quizzes', 'games', 'experiments'],
    default: 'points'
  },
  rankings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    change: {
      type: Number,
      default: 0 // Position change from last update
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Indexes for performance
badgeSchema.index({ category: 1, isActive: 1 });
levelSchema.index({ level: 1 });
leaderboardSchema.index({ type: 1, timeframe: 1, category: 1 });
leaderboardSchema.index({ 'rankings.user': 1 });

module.exports = {
  Badge: mongoose.model('Badge', badgeSchema),
  Level: mongoose.model('Level', levelSchema),
  CertificateTemplate: mongoose.model('CertificateTemplate', certificateTemplateSchema),
  Leaderboard: mongoose.model('Leaderboard', leaderboardSchema)
};