const mongoose = require('mongoose');

const followUpTaskSchema = new mongoose.Schema(
  {
    plantedTreeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantedTree',
      required: true,
      index: true
    },
    followUpNumber: {
      type: Number,
      enum: [1, 2, 3],
      required: true
    },
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected', 'overdue'],
      default: 'pending',
      index: true
    },
    photoUrl: String,
    health: {
      type: String,
      enum: ['thriving', 'healthy', 'struggling', 'dead']
    },
    notes: String,
    pointsAwarded: {
      type: Number,
      default: 0
    },
    verifiedDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teacherNotes: String
  },
  { timestamps: true }
);

followUpTaskSchema.index({ plantedTreeId: 1, followUpNumber: 1 }, { unique: true });

module.exports = mongoose.model('FollowUpTask', followUpTaskSchema);
