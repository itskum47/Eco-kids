const mongoose = require('mongoose');

const impactDailyActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actionType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    actionDate: {
      type: Date,
      required: true,
      index: true
    },
    impact: {
      co2Prevented: { type: Number, default: 0 },
      waterSaved: { type: Number, default: 0 },
      plasticReduced: { type: Number, default: 0 },
      energySaved: { type: Number, default: 0 },
      treesPlanted: { type: Number, default: 0 }
    },
    metadata: {
      label: String,
      source: {
        type: String,
        default: 'quick-action'
      },
      customValue: Number
    }
  },
  { timestamps: true }
);

impactDailyActionSchema.index({ userId: 1, actionDate: -1 });
impactDailyActionSchema.index({ userId: 1, actionType: 1, actionDate: -1 });

module.exports = mongoose.model('ImpactDailyAction', impactDailyActionSchema);
