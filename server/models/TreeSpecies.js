const mongoose = require('mongoose');

const treeSpeciesSchema = new mongoose.Schema(
  {
    speciesId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    scientificName: {
      type: String,
      required: true,
      trim: true
    },
    commonNameEn: {
      type: String,
      required: true,
      trim: true
    },
    commonNameHi: {
      type: String,
      required: true,
      trim: true
    },
    region: {
      type: String,
      enum: ['himalayan', 'coastal', 'desert', 'forest', 'urban'],
      required: true,
      index: true
    },
    nativeStates: [{ type: String, trim: true }],
    matureHeight: Number,
    matureAge: Number,
    waterNeeds: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    sunlight: {
      type: String,
      enum: ['full', 'partial', 'shade'],
      default: 'full'
    },
    soilType: String,
    co2AbsorptionPerYear: { type: Number, default: 0 },
    waterUsagePerYear: { type: Number, default: 0 },
    description: String,
    icon: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

treeSpeciesSchema.index({ region: 1, isActive: 1 });

treeSpeciesSchema.index({ commonNameEn: 1, scientificName: 1 });

module.exports = mongoose.model('TreeSpecies', treeSpeciesSchema);
