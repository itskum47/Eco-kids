const mongoose = require('mongoose');

const HABIT_CATEGORIES = [
  'energy-saving',
  'water-saving',
  'waste-recycling',
  'sustainable-transport',
  'eco-friendly-food',
  'plastic-reduction'
];

const impactSchema = {
  treesPlanted: { type: Number, default: 0 },
  co2Prevented: { type: Number, default: 0 },
  waterSaved: { type: Number, default: 0 },
  plasticReduced: { type: Number, default: 0 },
  energySaved: { type: Number, default: 0 },
  activitiesCompleted: { type: Number, default: 0 }
};

const DailyHabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  habits: [{
    category: {
      type: String,
      enum: HABIT_CATEGORIES,
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    },
    impactGenerated: impactSchema
  }],
  totalImpact: {
    co2Prevented: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 },
    plasticReduced: { type: Number, default: 0 },
    energySaved: { type: Number, default: 0 },
    activitiesCompleted: { type: Number, default: 0 }
  },
  streakContinued: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

DailyHabitSchema.index({ user: 1, date: 1 }, { unique: true });
DailyHabitSchema.index({ user: 1, date: -1 });

const DailyHabit = mongoose.model('DailyHabit', DailyHabitSchema);
DailyHabit.HABIT_CATEGORIES = HABIT_CATEGORIES;

module.exports = DailyHabit;
