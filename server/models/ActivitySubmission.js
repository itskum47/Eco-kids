const mongoose = require('mongoose');

const ActivitySubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  schoolId: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    index: true
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  fileHash: {
    type: String,
    unique: true,
    sparse: true,
    index: true // Ensures fast duplicate detection queries
  },
  pHash: {
    type: String,
    sparse: true,
    index: true // Perceptual hash for visual similarity dedup
  },
  geoLocation: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
    timestamp: { type: Date }
  },
  activityType: {
    type: String,
    enum: [
      "tree-planting",
      "waste-recycling",
      "water-saving",
      "energy-saving",
      "plastic-reduction",
      "composting",
      "biodiversity-survey"
    ],
    required: true,
    index: true
  },
  sdgGoals: [{
    type: Number,
    min: 1,
    max: 17,
    index: true
  }],
  nepCompetencies: [{
    type: String,
    enum: [
      'critical-thinking',
      'environmental-awareness',
      'scientific-temper',
      'problem-solving',
      'collaboration',
      'experiential-learning',
      'sustainable-living',
      'civic-responsibility'
    ],
    index: true
  }],
  evidence: {
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  impactApplied: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    required: function () { return this.status === 'rejected'; }, // Assuming 'rejected' is the correct enum value
    trim: true
  },
  school: {
    type: String,
    index: true
  },
  district: {
    type: String,
    index: true
  },
  state: {
    type: String,
    index: true
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes for activity queries
ActivitySubmissionSchema.index({ status: 1, createdAt: -1 });
ActivitySubmissionSchema.index({ user: 1, status: 1 });
ActivitySubmissionSchema.index({ status: 1, schoolId: 1 }); // 🛡 Fast lookup for teacher dashboard

// === Performance Indexes ===
ActivitySubmissionSchema.index({ user: 1, activityType: 1, createdAt: -1 });
ActivitySubmissionSchema.index({ status: 1, createdAt: -1, user: 1 });
ActivitySubmissionSchema.index({ state: 1, district: 1, school: 1, status: 1 });
ActivitySubmissionSchema.index({ schoolId: 1, nepCompetencies: 1, status: 1 });
ActivitySubmissionSchema.index({ status: 1, sdgGoals: 1, createdAt: -1 });

module.exports = mongoose.model('ActivitySubmission', ActivitySubmissionSchema);
