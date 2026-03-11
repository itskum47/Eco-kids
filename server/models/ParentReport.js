const mongoose = require('mongoose');

const ParentReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      default: () => `PARENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    reportPeriod: {
      startDate: {
        type: Date,
        default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
      endDate: {
        type: Date,
        default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
      periodType: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'semester', 'annual'],
        default: 'monthly',
      },
    },

    // Student Activities Summary
    activityMetrics: {
      totalActivitiesSubmitted: { type: Number, default: 0 },
      activitiesApproved: { type: Number, default: 0 },
      activitiesPending: { type: Number, default: 0 },
      activitiesRejected: { type: Number, default: 0 },
      approvalRate: { type: Number, default: 0 }, // Percentage
      topActivityType: String,
      activityDistribution: {
        treesCounted: { type: Number, default: 0 },
        wasteSegratedKg: { type: Number, default: 0 },
        waterSavedLitres: { type: Number, default: 0 },
        communityServiceHours: { type: Number, default: 0 },
        plasticReducedKg: { type: Number, default: 0 },
      },
    },

    // Eco-Points & Gamification
    gamificationMetrics: {
      totalEcoPoints: { type: Number, default: 0 },
      pointsThisPeriod: { type: Number, default: 0 },
      currentLevel: { type: Number, default: 1 },
      badgesEarned: [
        {
          badgeId: mongoose.Schema.Types.ObjectId,
          badgeName: String,
          earnedDate: Date,
          description: String,
        },
      ],
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      leaderboardRank: {
        classRank: Number,
        schoolRank: Number,
        districtRank: Number,
      },
    },

    // Habit Tracking
    habitMetrics: {
      activeHabits: { type: Number, default: 0 },
      habitCompletionRate: { type: Number, default: 0 }, // Percentage
      habits: [
        {
          habitId: mongoose.Schema.Types.ObjectId,
          habitName: String,
          category: String, // energy, water, waste, transportation, food
          currentStreak: Number,
          longestStreak: Number,
          completionsThisPeriod: Number,
          weeklyProgress: [Boolean], // 7-day array
          status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
        },
      ],
      habitsByCategory: {
        energy: { active: Number, completionRate: Number },
        water: { active: Number, completionRate: Number },
        waste: { active: Number, completionRate: Number },
        transportation: { active: Number, completionRate: Number },
        food: { active: Number, completionRate: Number },
      },
    },

    // Challenges & Competitions
    challengeMetrics: {
      challengesParticipated: { type: Number, default: 0 },
      challengesCompleted: { type: Number, default: 0 },
      challengeCompletionRate: { type: Number, default: 0 }, // Percentage
      teamParticipation: {
        teamName: String,
        teamId: mongoose.Schema.Types.ObjectId,
        role: { type: String, enum: ['member', 'leader'] },
        teamRank: Number,
      },
      recentChallenges: [
        {
          challengeId: mongoose.Schema.Types.ObjectId,
          challengeName: String,
          difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'extreme'] },
          status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
          pointsEarned: Number,
          completedDate: Date,
        },
      ],
    },

    // Environmental Impact
    environmentalImpact: {
      co2PreventedKg: { type: Number, default: 0 },
      waterSavedLitres: { type: Number, default: 0 },
      plasticReducedKg: { type: Number, default: 0 },
      treesContributed: { type: Number, default: 0 },
      energySavedKWh: { type: Number, default: 0 },
      impactLevel: {
        type: String,
        enum: ['minimal', 'low', 'moderate', 'high', 'very_high'],
        default: 'low',
      },
    },

    // Learning & Development
    learningMetrics: {
      lessonsCompleted: { type: Number, default: 0 },
      quizzesAttempted: { type: Number, default: 0 },
      assessmentScore: { type: Number, default: 0 }, // 0-100
      averageScore: { type: Number, default: 0 },
      skillsDeveloped: [
        {
          skillName: String,
          improvementPercentage: Number,
          lastAssessed: Date,
        },
      ],
      topicsCovered: [String],
      recommendedFocus: [String], // Topics needing improvement
    },

    // School Performance Comparison
    schoolComparison: {
      studentRankInClass: Number,
      studentRankInSchool: Number,
      classAverageEcoPoints: Number,
      schoolAverageEcoPoints: Number,
      studentPercentile: Number, // 0-100 (student's position in school)
      performanceTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
        default: 'stable',
      },
    },

    // Parent Insights & Recommendations
    parentInsights: {
      overallPerformance: {
        type: String,
        enum: ['excellent', 'good', 'average', 'needs_improvement'],
        default: 'average',
      },
      strengths: [String], // What the student is doing well
      areasForImprovement: [String], // What needs work
      recommendations: [
        {
          area: String,
          suggestion: String,
          priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
          actionItems: [String],
        },
      ],
      nextSteps: [String],
      encouragingMessage: String,
    },

    // Parent Actions
    parentAcknowledgment: {
      acknowledged: { type: Boolean, default: false },
      acknowledgedDate: Date,
      acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      parentComments: String,
      sharedWithStudent: { type: Boolean, default: false },
      sharedWithTeacher: { type: Boolean, default: false },
    },

    // Report Status & History
    status: {
      type: String,
      enum: ['draft', 'generated', 'sent', 'acknowledged', 'archived'],
      default: 'generated',
    },
    sentDate: Date,
    readDate: Date,
    expiresAt: Date, // When parent can no longer access this report

    // Contact & Communication
    schoolContactInfo: {
      teacherName: String,
      teacherEmail: String,
      classTeacherId: mongoose.Schema.Types.ObjectId,
    },
    parentNotificationMethod: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'in-app'],
      default: 'email',
    },

    // Downloadable Report
    reportFile: {
      generatedAt: Date,
      fileName: String,
      fileSize: Number,
      fileFormat: { type: String, enum: ['pdf', 'excel', 'both'], default: 'pdf' },
    },

    // Privacy & Consent
    consentGiven: {
      type: Boolean,
      default: true,
      ref: 'ParentalConsent',
    },
    dataSharedWith: [String], // Teachers, school admin, etc.

    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      generatedBy: {
        type: String,
        enum: ['system', 'teacher', 'admin'],
        default: 'system',
      },
      generatedByUserId: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
ParentReportSchema.index({ parentId: 1, studentId: 1, 'reportPeriod.endDate': -1 });
ParentReportSchema.index({ schoolId: 1, 'reportPeriod.endDate': -1 });
ParentReportSchema.index({ status: 1, sentDate: -1 });
ParentReportSchema.index({ expiresAt: 1 });
ParentReportSchema.index({ reportId: 1 });

// Methods
ParentReportSchema.methods.markAsRead = function () {
  this.readDate = new Date();
  this.status = 'acknowledged';
  return this.save();
};

ParentReportSchema.methods.acknowledge = function (acknowledgedBy, comments = '') {
  this.parentAcknowledgment.acknowledged = true;
  this.parentAcknowledgment.acknowledgedDate = new Date();
  this.parentAcknowledgment.acknowledgedBy = acknowledgedBy;
  this.parentAcknowledgment.parentComments = comments;
  this.status = 'acknowledged';
  return this.save();
};

ParentReportSchema.methods.calculateOverallPerformance = function () {
  const totalPoints = this.gamificationMetrics.totalEcoPoints || 0;
  const habitRate = this.habitMetrics.habitCompletionRate || 0;
  const challengeRate = this.challengeMetrics.challengeCompletionRate || 0;
  const assessmentScore = this.learningMetrics.assessmentScore || 0;

  const score = (totalPoints / 1000) * 0.3 + (habitRate / 100) * 0.3 + (challengeRate / 100) * 0.2 + (assessmentScore / 100) * 0.2;

  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  return 'needs_improvement';
};

ParentReportSchema.methods.generateRecommendations = function () {
  const recommendations = [];

  // Habit recommendations
  if (this.habitMetrics.habitCompletionRate < 50) {
    recommendations.push({
      area: 'Daily Eco-Habits',
      suggestion: 'Encourage your child to complete daily eco-habits consistently.',
      priority: 'high',
      actionItems: [
        'Set reminders for habit completion',
        'Participate in habits together (family eco-challenge)',
        'Celebrate weekly milestones',
      ],
    });
  }

  // Challenge participation
  if (this.challengeMetrics.challengesParticipated < 3) {
    recommendations.push({
      area: 'Challenge Participation',
      suggestion: 'Your child can benefit from participating in more environmental challenges.',
      priority: 'medium',
      actionItems: [
        'Check available challenges in the app',
        'Join team challenges for collaboration',
        'Discuss challenge progress at home',
      ],
    });
  }

  // Activity submission
  if (this.activityMetrics.totalActivitiesSubmitted < 5) {
    recommendations.push({
      area: 'Real-World Activities',
      suggestion: 'Increase participation in environmental activities with photo evidence.',
      priority: 'high',
      actionItems: [
        'Plan weekly environmental activities',
        'Document activities with photos',
        'Share experience in eco-feed',
      ],
    });
  }

  // Skills development
  if (this.learningMetrics.assessmentScore < 60) {
    recommendations.push({
      area: 'Learning & Assessment',
      suggestion: 'Focus on environmental science lessons to improve assessment scores.',
      priority: 'high',
      actionItems: [
        'Complete pending lessons',
        'Attempt practice quizzes',
        'Review weak topics with teacher',
      ],
    });
  }

  this.parentInsights.recommendations = recommendations;
  return recommendations;
};

module.exports = mongoose.model('ParentReport', ParentReportSchema);
