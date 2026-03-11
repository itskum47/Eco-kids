const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  topicId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Topic',
    default: null
  },
  quizId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    default: null
  },
  gameId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    default: null
  },
  experimentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Experiment',
    default: null
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  score: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  data: {
    // Store activity-specific data
    quizAnswers: [{
      questionId: String,
      selectedAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeSpent: Number
    }],
    gameProgress: {
      level: Number,
      achievements: [String],
      highScore: Number,
      unlockedFeatures: [String]
    },
    experimentProgress: {
      stepsCompleted: [String],
      observations: [{
        step: String,
        observation: String,
        timestamp: Date
      }],
      results: mongoose.Schema.Types.Mixed
    },
    topicProgress: {
      sectionsCompleted: [String],
      notesAdded: [String],
      bookmarked: Boolean
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
ProgressSchema.index({ userId: 1, status: 1 });
ProgressSchema.index({ userId: 1, topicId: 1 });
ProgressSchema.index({ userId: 1, quizId: 1 });
ProgressSchema.index({ userId: 1, gameId: 1 });
ProgressSchema.index({ userId: 1, experimentId: 1 });

// Virtual for completion percentage
ProgressSchema.virtual('completionPercentage').get(function() {
  return this.progress;
});

// Method to update progress
ProgressSchema.methods.updateProgress = function(newProgress, additionalData = {}) {
  this.progress = Math.min(100, Math.max(0, newProgress));
  this.lastAttemptAt = new Date();
  
  if (newProgress >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (newProgress > 0 && this.status === 'not_started') {
    this.status = 'in_progress';
  }
  
  // Merge additional data
  if (additionalData) {
    this.data = { ...this.data, ...additionalData };
  }
  
  return this.save();
};

// Method to record quiz attempt
ProgressSchema.methods.recordQuizAttempt = function(answers, score) {
  this.attempts += 1;
  this.score = score;
  this.bestScore = Math.max(this.bestScore, score);
  this.lastAttemptAt = new Date();
  
  if (!this.data) this.data = {};
  if (!this.data.quizAnswers) this.data.quizAnswers = [];
  
  this.data.quizAnswers = answers;
  
  // Update progress based on score (assuming 70% is completion threshold)
  const completionThreshold = 70;
  if (score >= completionThreshold) {
    this.progress = 100;
    this.status = 'completed';
    this.completedAt = new Date();
  } else {
    this.progress = Math.max(this.progress, score);
    this.status = 'in_progress';
  }
  
  return this.save();
};

// Static method to get user's overall progress
ProgressSchema.statics.getUserOverallProgress = async function(userId) {
  const progress = await this.find({ userId });
  
  const stats = {
    total: progress.length,
    completed: progress.filter(p => p.status === 'completed').length,
    inProgress: progress.filter(p => p.status === 'in_progress').length,
    notStarted: progress.filter(p => p.status === 'not_started').length,
    averageScore: 0,
    totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
  };
  
  const scoresWithValues = progress.filter(p => p.score > 0);
  if (scoresWithValues.length > 0) {
    stats.averageScore = scoresWithValues.reduce((sum, p) => sum + p.score, 0) / scoresWithValues.length;
  }
  
  stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  return stats;
};

module.exports = mongoose.model('Progress', ProgressSchema);