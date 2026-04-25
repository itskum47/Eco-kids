const mongoose = require('mongoose');

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    boardType: {
      type: String,
      enum: ['global', 'school', 'district'],
      required: true,
      index: true,
    },
    scope: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scopeKey: {
      type: String,
      required: true,
      index: true,
    },
    snapshotAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    scoreModelVersion: {
      type: String,
      default: 'score-authority-v1',
    },
    snapshotHash: {
      type: String,
      required: true,
      index: true,
    },
    entryCount: {
      type: Number,
      required: true,
      default: 0,
    },
    topEntries: [
      {
        rank: Number,
        id: String,
        name: String,
        ecoPoints: Number,
        level: Number,
        streak: Number,
        school: String,
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

leaderboardSnapshotSchema.index({ boardType: 1, scopeKey: 1, snapshotAt: -1 });

module.exports = mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
