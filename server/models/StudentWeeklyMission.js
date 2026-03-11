const mongoose = require('mongoose');

const missionProgressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🎯'
  },
  reward: {
    type: Number,
    required: true,
    min: 1
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const StudentWeeklyMissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  missions: [missionProgressSchema],
  allCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  completedCount: {
    type: Number,
    default: 0
  },
  totalReward: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for finding active missions per user
StudentWeeklyMissionSchema.index({ user: 1, expiresAt: 1 });
StudentWeeklyMissionSchema.index({ user: 1, weekStartDate: 1 });

// Prevent duplicate missions for same week/user
StudentWeeklyMissionSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('StudentWeeklyMission', StudentWeeklyMissionSchema);
