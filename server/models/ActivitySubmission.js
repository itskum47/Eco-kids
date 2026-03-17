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
      'tree-planting',
      'waste-segregation',
      'water-conservation',
      'energy-saving',
      'composting',
      'nature-walk',
      'quiz-completion',
      'stubble-management',
      'sutlej-cleanup',
      'groundwater-conservation',
      'air-quality-monitoring',
      'urban-tree-planting',
      'research-track'
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
    imageFileId: {
      type: String
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
    enum: [
      'pending', 'ai_processing', 'ai_approved',
      'pending_review', 'teacher_approved', 'teacher_rejected', 'appealed', 'appeal_rejected',
      // Legacy backward compat — do not use in new code
      'approved', 'rejected', 'pending_ai', 'rejected_ai'
    ],
    default: 'pending',
    index: true
  },
  activityPoints: { type: Number, default: 10, min: 1, max: 100 },
  deviceTimestamp: { type: Date },
  aiValidation: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'timeout'],
      default: 'pending'
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    isVerified: { type: Boolean },
    isValid: Boolean,
    analysis: { type: String },
    tags: [{ type: String }],
    flags: [String],
    rejectionReason: { type: String },
    rawResponse: mongoose.Schema.Types.Mixed,
    processedAt: Date
  },
  flags: [{ type: String }],
  teacherReview: {
    teacherId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    decision: {
      type: String,
      enum: ['approve', 'reject']
    },
    reviewedAt: Date,
    notes: String
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
  appealReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Appeal reason cannot exceed 200 characters']
  },
  appealedAt: Date,
  appealed_at: Date,
  appealDecision: {
    type: String,
    enum: ['approved', 'rejected']
  },
  appealTeacherNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Teacher note cannot exceed 500 characters']
  },
  appealResolvedAt: Date,
  appealResolvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
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
    ,
    // Research Track fields (UG students only)
    researchTrack: {
      writeUp: {
        type: String,
        maxlength: [2000, 'Write-up cannot exceed 2000 characters']
      },
      wordCount: {
        type: Number
      },
      gpsCoordinates: {
        lat: Number,
        lng: Number
      },
      facultyAdvisorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    }
}, {
  timestamps: true
});

ActivitySubmissionSchema.pre('save', function (next) {
  const legacy = ['approved', 'rejected', 'pending_ai', 'rejected_ai'];
  if (legacy.includes(this.status)) {
    console.warn(`[ActivitySubmission] Legacy status '${this.status}' on ${this._id}`);
  }
  next();
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
ActivitySubmissionSchema.index({ school: 1, status: 1, createdAt: -1 });
ActivitySubmissionSchema.index({ user: 1, activityType: 1, createdAt: -1 });
ActivitySubmissionSchema.index({ status: 1, 'aiValidation.confidenceScore': -1 });

module.exports = mongoose.model('ActivitySubmission', ActivitySubmissionSchema);
