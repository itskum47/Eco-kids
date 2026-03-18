const mongoose = require('mongoose');

const plantedTreeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    speciesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreeSpecies',
      required: true,
      index: true
    },
    plantedDate: {
      type: Date,
      required: true,
      index: true
    },
    location: {
      latitude: Number,
      longitude: Number,
      name: String
    },
    photoUrl: {
      type: String,
      required: true
    },
    notes: String,
    status: {
      type: String,
      enum: ['active', 'thriving', 'healthy', 'struggling', 'dead'],
      default: 'active',
      index: true
    },
    pointsAwarded: {
      type: Number,
      default: 50
    },
    followUpDates: [{ type: Date }],
    lastVerifiedAt: Date
  },
  { timestamps: true }
);

plantedTreeSchema.index({ userId: 1, plantedDate: -1 });

module.exports = mongoose.model('PlantedTree', plantedTreeSchema);
