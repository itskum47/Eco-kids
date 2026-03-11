/**
 * @fileoverview Government Integration Model
 * Tracks compliance and integration with NEP 2020 and government reporting
 */

const mongoose = require('mongoose');

const governmentReportSchema = new mongoose.Schema({
  // Report metadata
  reportId: {
    type: String,
    unique: true,
    required: true,
    // Format: GOVT_YYYY_MM_DD_HH_MM_SS
    default: () => `GOVT_${new Date().toISOString().replace(/[:\-]/g, '_').split('.')[0]}`
  },
  
  reportType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'compliance'],
    default: 'monthly',
    required: true
  },

  // Reporting period
  reportingPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },

  // Jurisdiction
  state: String,
  district: String,
  schoolCount: Number,

  // Student metrics
  studentMetrics: {
    totalStudents: {
      type: Number,
      default: 0
    },
    activeStudents: {
      type: Number,
      default: 0
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    averageEcoPoints: {
      type: Number,
      default: 0
    },
    enrollmentRate: {
      type: Number,
      default: 0
    } // Percentage
  },

  // Learning outcomes (NEP 2020)
  learningOutcomes: {
    environmentalAwareness: {
      type: Number, // Percentage of students demonstrating awareness
      default: 0
    },
    skillsDeveloped: [String], // e.g., "critical thinking", "problem solving"
    competenciesGained: [String], // NEP competencies
    assessmentScores: {
      average: Number,
      distribution: {
        excellent: Number,
        good: Number,
        satisfactory: Number,
        needsImprovement: Number
      }
    }
  },

  // Environmental impact
  environmentalImpact: {
    co2PreventedTonnes: Number,
    waterSavedLitres: Number,
    plasticReducedKgs: Number,
    treesPlanted: Number,
    energySavedKWh: Number
  },

  // Activity breakdown
  activityMetrics: {
    totalActivitiesSubmitted: Number,
    approvalRate: Number, // % approved
    averageCompletionTime: Number, // Days
    topActivity: String,
    activityDistribution: {
      waste: Number,
      water: Number,
      energy: Number,
      biodiversity: Number,
      pollution: Number
    }
  },

  // School-level data
  schoolPerformance: [{
    schoolId: mongoose.Schema.Types.ObjectId,
    schoolName: String,
    studentCount: Number,
    tasksCompleted: Number,
    averageEcoPoints: Number,
    complianceStatus: {
      type: String,
      enum: ['compliant', 'partially-compliant', 'non-compliant'],
      default: 'partially-compliant'
    }
  }],

  // Compliance tracking
  compliance: {
    pocsoActCompliance: {
      status: {
        type: String,
        enum: ['compliant', 'pending-review', 'non-compliant'],
        default: 'compliant'
      },
      childSafetyReviewDate: Date,
      dataProtectionScore: Number
    },
    nep2020Alignment: {
      status: String,
      skillsAlighedWithNEP: [String],
      competenciesMatched: Number,
      curriculumCoveragePercentage: Number
    },
    auditLog: [{
      action: String,
      timestamp: Date,
      auditedBy: String,
      findings: String
    }]
  },

  // Teacher engagement
  teacherEngagement: {
    totalTeachers: Number,
    trainingCompleted: Number,
    averageRating: Number,
    acceptanceRate: Number // % teachers using platform
  },

  // Parental consent
  parentalConsent: {
    totalConsentRequests: Number,
    consentObtained: Number,
    consentRate: Number, // Percentage
    consentStatus: {
      type: String,
      enum: ['all-obtained', 'partial', 'pending'],
      default: 'pending'
    }
  },

  // Quality metrics
  qualityMetrics: {
    contentQualityScore: Number,
    userExperienceScore: Number,
    technicalUptimePercentage: Number,
    dataAccuracyScore: Number
  },

  // Recommendations
  recommendations: [
    {
      area: String,
      finding: String,
      suggestedAction: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }
  ],

  // Report status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected'],
    default: 'draft',
    required: true
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  submissionDate: Date,

  reviewNotes: String,

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approvalDate: Date,

  // Digital signature / authentication
  signature: {
    signedBy: String,
    signatureDate: Date,
    signatureHash: String
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

// ============================================================================
// INDEXES
// ============================================================================

governmentReportSchema.index({ state: 1, reportingPeriod: 1 });
governmentReportSchema.index({ status: 1 });
governmentReportSchema.index({ submissionDate: -1 });
governmentReportSchema.index({ reportType: 1, reportingPeriod: 1 });

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Generate monthly government report
 */
governmentReportSchema.statics.generateMonthlyReport = async function (state, district) {
  // Aggregate data for the month
  // This would be populated with real data from activities, submissions, etc.
  
  const report = new this({
    reportType: 'monthly',
    state,
    district,
    reportingPeriod: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
  });

  return report;
};

/**
 * Get compliance dashboard data
 */
governmentReportSchema.statics.getComplianceDashboard = function (state) {
  return this.find({ state, status: { $in: ['submitted', 'approved'] } })
    .sort({ submissionDate: -1 })
    .limit(12); // Last 12 reports
};

module.exports = mongoose.model('GovernmentReport', governmentReportSchema);
