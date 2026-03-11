/**
 * @fileoverview Sustainability Habit Model
 * Tracks daily eco-habits and user streaks
 */

const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: ['energy', 'water', 'waste', 'transportation', 'food'],
    required: true
  },
  icon: String, // Emoji or icon name
  color: String,

  // Tracking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },

  // Completion tracking
  completedDates: [Date], // Array of dates when habit was completed
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletion: {
    type: Number,
    default: 0
  },

  // Rewards
  ecoPointsPerCompletion: {
    type: Number,
    default: 10
  },
  weeklyTarget: {
    type: Number,
    default: 7 // Complete every day
  },

  // Frequency
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  daysOfWeek: [Number], // 0-6 (Sunday to Saturday)

  // Reminders
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  reminderTime: String, // HH:MM format (e.g., "07:00")

  // Stats
  stats: {
    weeklyCompletion: {
      type: Number,
      default: 0 // Out of 7
    },
    monthlyCompletion: {
      type: Number,
      default: 0 // Out of ~30
    },
    lastCompleted: Date,
    nextReminder: Date
  },

  // Family features
  isFamily: {
    type: Boolean,
    default: false
  },
  familyHabit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyHabit'
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ============================================================================
// INDEXES
// ============================================================================

habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ category: 1 });
habitSchema.index({ currentStreak: -1 });
habitSchema.index({ completedDates: 1 });

// ============================================================================
// METHODS
// ============================================================================

/**
 * Log habit completion for today
 */
habitSchema.methods.logCompletion = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already completed today
  const alreadyCompleted = this.completedDates.some(date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  if (alreadyCompleted) {
    return { message: 'Already completed today', status: false };
  }

  // Add today to completed dates
  this.completedDates.push(today);
  this.totalCompletion += 1;

  // Calculate streak
  let streak = 1;
  let currentDate = new Date(today);

  for (let i = 1; i < this.completedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    prevDate.setHours(0, 0, 0, 0);

    const completedOn = this.completedDates.find(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === prevDate.getTime();
    });

    if (completedOn) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  this.currentStreak = streak;

  // Update longest streak
  if (streak > this.longestStreak) {
    this.longestStreak = streak;
  }

  // Update weekly completion
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  this.stats.weeklyCompletion = this.completedDates.filter(date => date >= weekAgo).length;

  this.stats.lastCompleted = today;

  return { message: 'Habit logged successfully', status: true, streak };
};

/**
 * Get weekly progress
 */
habitSchema.methods.getWeeklyProgress = function () {
  const today = new Date();
  const progress = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const completed = this.completedDates.some(d => {
      const compDate = new Date(d);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === date.getTime();
    });

    progress.push({
      date: date.toISOString().split('T')[0],
      completed
    });
  }

  return progress;
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Get all habits for a user
 */
habitSchema.statics.getUserHabits = function (userId) {
  return this.find({ userId, isActive: true }).sort('-currentStreak');
};

/**
 * Get school leaderboard by habit streaks
 */
habitSchema.statics.getSchoolHabitLeaderboard = function (schoolId, limit = 10) {
  return this.find({ schoolId, isActive: true })
    .populate('userId', 'name profile.school')
    .sort('-currentStreak')
    .limit(limit);
};

module.exports = mongoose.model('Habit', habitSchema);
