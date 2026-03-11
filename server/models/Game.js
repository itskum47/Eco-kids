const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a game title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide game instructions']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'maze',
      'puzzle',
      'memory',
      'matching',
      'sorting',
      'quiz',
      'adventure',
      'simulation'
    ]
  },
  gameType: {
    type: String,
    enum: ['canvas', 'html', 'unity', 'interactive'],
    default: 'canvas'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  gradeLevel: [{
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }],
  environmentalTheme: {
    topic: {
      type: String,
      enum: [
        'air-pollution',
        'water-conservation',
        'biodiversity',
        'climate-change',
        'waste-management',
        'renewable-energy',
        'soil-health',
        'forest-conservation'
      ]
    },
    learningObjective: String,
    educationalContent: String
  },
  gameAssets: {
    thumbnailImage: String,
    backgroundImages: [String],
    characterSprites: [String],
    soundEffects: [String],
    backgroundMusic: String,
    gameData: mongoose.Schema.Types.Mixed // Store game-specific data
  },
  controls: {
    type: [{
      action: String,
      key: String,
      description: String
    }],
    default: []
  },
  scoring: {
    pointsPerAction: {
      type: Number,
      default: 10
    },
    bonusMultiplier: {
      type: Number,
      default: 1.5
    },
    timeBonus: {
      type: Boolean,
      default: true
    },
    accuracyBonus: {
      type: Boolean,
      default: true
    },
    maxScore: Number
  },
  levels: [{
    levelNumber: Number,
    title: String,
    description: String,
    difficulty: String,
    objectives: [String],
    timeLimit: Number, // in seconds
    levelData: mongoose.Schema.Types.Mixed
  }],
  achievements: [{
    id: String,
    name: String,
    description: String,
    condition: String, // e.g., "score > 1000", "time < 60"
    points: Number,
    badge: String
  }],
  leaderboard: {
    enabled: {
      type: Boolean,
      default: true
    },
    resetPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'monthly'
    }
  },
  indianContext: {
    setting: String, // e.g., "Delhi streets", "Ganga riverbank"
    characters: [String], // Indian-themed characters
    scenarios: [String], // Local environmental scenarios
    culturalElements: [String]
  },
  accessibility: {
    colorBlindFriendly: {
      type: Boolean,
      default: false
    },
    keyboardSupport: {
      type: Boolean,
      default: true
    },
    audioDescriptions: {
      type: Boolean,
      default: false
    },
    subtitles: {
      type: Boolean,
      default: false
    }
  },
  gameMetrics: {
    totalPlays: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    rating: {
      total: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      },
      average: {
        type: Number,
        default: 0
      }
    }
  },
  status: {
    type: String,
    enum: ['development', 'testing', 'published', 'maintenance'],
    default: 'development'
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  publishedAt: Date,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  tags: [String],
  relatedTopics: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Topic'
  }],
  translations: {
    hindi: {
      title: String,
      description: String,
      instructions: String
    },
    bengali: {
      title: String,
      description: String,
      instructions: String
    },
    tamil: {
      title: String,
      description: String,
      instructions: String
    },
    telugu: {
      title: String,
      description: String,
      instructions: String
    },
    marathi: {
      title: String,
      description: String,
      instructions: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
GameSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Virtual for popularity score
GameSchema.virtual('popularityScore').get(function() {
  const plays = this.gameMetrics.totalPlays || 0;
  const rating = this.gameMetrics.rating.average || 0;
  const completion = this.gameMetrics.completionRate || 0;
  
  return (plays * 0.4) + (rating * 20) + (completion * 0.4);
});

// Virtual for difficulty level numeric value
GameSchema.virtual('difficultyLevel').get(function() {
  const levels = { easy: 1, medium: 2, hard: 3 };
  return levels[this.difficulty] || 1;
});

// Static method to get popular games
GameSchema.statics.getPopularGames = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'gameMetrics.totalPlays': -1, 'gameMetrics.rating.average': -1 })
    .limit(limit)
    .populate('author', 'name profile.avatar');
};

// Static method to get games by category
GameSchema.statics.getGamesByCategory = function(category, limit = 10) {
  return this.find({ category, status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name profile.avatar');
};

// Instance method to record game play
GameSchema.methods.recordPlay = function(score, completionTime, completed = true) {
  this.gameMetrics.totalPlays += 1;
  
  // Update average score
  if (score !== undefined) {
    const currentTotal = this.gameMetrics.averageScore * (this.gameMetrics.totalPlays - 1);
    this.gameMetrics.averageScore = (currentTotal + score) / this.gameMetrics.totalPlays;
  }
  
  // Update average completion time
  if (completionTime !== undefined) {
    const currentTimeTotal = this.gameMetrics.averageCompletionTime * (this.gameMetrics.totalPlays - 1);
    this.gameMetrics.averageCompletionTime = (currentTimeTotal + completionTime) / this.gameMetrics.totalPlays;
  }
  
  // Update completion rate
  if (completed) {
    const completions = Math.round(this.gameMetrics.completionRate * (this.gameMetrics.totalPlays - 1) / 100) + 1;
    this.gameMetrics.completionRate = (completions / this.gameMetrics.totalPlays) * 100;
  }
  
  return this.save();
};

// Instance method to add rating
GameSchema.methods.addRating = function(rating) {
  const currentTotal = this.gameMetrics.rating.total;
  const currentCount = this.gameMetrics.rating.count;
  
  this.gameMetrics.rating.total = currentTotal + rating;
  this.gameMetrics.rating.count = currentCount + 1;
  this.gameMetrics.rating.average = this.gameMetrics.rating.total / this.gameMetrics.rating.count;
  
  return this.save();
};

module.exports = mongoose.model('Game', GameSchema);