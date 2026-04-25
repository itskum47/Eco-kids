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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toUtcDayKey(value) {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function dayKeyToDate(dayKey) {
  return new Date(dayKey);
}

// ============================================================================
// METHODS
// ============================================================================

/**
 * Log habit completion for today
 */
habitSchema.methods.logCompletion = function (referenceDate = new Date()) {
  const todayKey = toUtcDayKey(referenceDate);
  const today = dayKeyToDate(todayKey);
  const existingKeys = new Set(this.completedDates.map((date) => toUtcDayKey(date)));

  // Check if already completed today
  if (existingKeys.has(todayKey)) {
    return { message: 'Already completed today', status: false };
  }

  const sortedKeysDesc = [...existingKeys].sort((a, b) => b - a);
  const latestKey = sortedKeysDesc[0];
  if (latestKey && todayKey < latestKey) {
    return { message: 'Cannot log completion for a past day', status: false };
  }

  // Add today to completed dates
  this.completedDates.push(today);
  this.totalCompletion += 1;
  existingKeys.add(todayKey);

  const completeKeysDesc = [...existingKeys].sort((a, b) => b - a);

  // Calculate streak
  let streak = 1;
  let currentKey = completeKeysDesc[0];

  for (let i = 1; i < completeKeysDesc.length; i++) {
    const expectedPrev = currentKey - DAY_IN_MS;
    if (completeKeysDesc[i] === expectedPrev) {
      streak++;
      currentKey = completeKeysDesc[i];
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
  const weekStartKey = todayKey - (6 * DAY_IN_MS);
  this.stats.weeklyCompletion = [...existingKeys].filter((key) => key >= weekStartKey && key <= todayKey).length;

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
