const mongoose = require('mongoose');

const EcoClubSchema = new mongoose.Schema(
  {
    clubId: {
      type: String,
      unique: true,
      default: () => `CLUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    clubName: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    clubFocusArea: {
      type: String,
      enum: ['general', 'energy', 'water', 'waste', 'biodiversity', 'climate', 'sustainability'],
      default: 'general',
    },
    clubImage: String, // URL to club logo/image

    // Leadership
    leadership: {
      principal: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        role: { type: String, default: 'Principal Advisor' },
      },
      coordinator: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: String,
        email: String,
        phone: String,
        role: { type: String, default: 'Club Coordinator' },
      },
      officers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          name: String,
          position: { type: String, enum: ['secretary', 'treasurer', 'events_lead', 'communications_lead'] },
          email: String,
        },
      ],
    },

    // Membership
    membership: {
      totalMembers: { type: Number, default: 0 },
      maxCapacity: { type: Number, default: 50 },
      members: [
        {
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          name: String,
          email: String,
          joinedDate: { type: Date, default: Date.now },
          role: { type: String, enum: ['member', 'officer'], default: 'member' },
          status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
          activitiesParticipated: { type: Number, default: 0 },
          ecoPointsEarned: { type: Number, default: 0 },
        },
      ],
      joinRequests: [
        {
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          requestDate: { type: Date, default: Date.now },
          status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        },
      ],
    },

    // Meeting Schedule
    meetingSchedule: {
      frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'weekly' },
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0-6 (Sunday-Saturday)
      meetingTime: { type: String }, // HH:MM format
      meetingLocation: String,
      virtualMeetingLink: String,
    },

    // Activities & Events
    activities: [
      {
        activityId: { type: mongoose.Schema.Types.ObjectId, auto: true },
        title: {
          type: String,
          required: true,
        },
        description: String,
        category: { type: String, enum: ['meeting', 'cleanup', 'plantation', 'awareness', 'experiment', 'other'] },
        objectives: [String], // Learning objectives
        plannedDate: Date,
        actualDate: Date,
        location: String,
        estimatedParticipants: Number,
        actualParticipants: { type: Number, default: 0 },
        status: { type: String, enum: ['planned', 'ongoing', 'completed', 'cancelled'], default: 'planned' },
        expectedEcoPoints: { type: Number, default: 0 },
        environmentalImpactExpected: {
          trees: Number,
          plasticKg: Number,
          waterLitres: Number,
          co2Kg: Number,
        },
        environmentalImpactActual: {
          trees: { type: Number, default: 0 },
          plasticKg: { type: Number, default: 0 },
          waterLitres: { type: Number, default: 0 },
          co2Kg: { type: Number, default: 0 },
        },
        images: [
          {
            url: String,
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            uploadedDate: Date,
            caption: String,
          },
        ],
        participants: [
          {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            hoursParticipated: Number,
            ecoPointsAwarded: Number,
            feedbackProvided: Boolean,
          },
        ],
      },
    ],

    // Activity Submissions & Verification
    submissionQueue: [
      {
        submissionId: mongoose.Schema.Types.ObjectId,
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        activityId: mongoose.Schema.Types.ObjectId,
        description: String,
        photosUrls: [String],
        location: String,
        submittedDate: Date,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verificationDate: Date,
        ecoPointsAwarded: { type: Number, default: 0 },
        verificationComments: String,
      },
    ],

    // Goals & Targets
    goals: [
      {
        goalId: mongoose.Schema.Types.ObjectId,
        title: String,
        description: String,
        category: String, // trees, plastic, water, etc.
        targetValue: Number,
        targetUnit: String, // pieces, kg, litres, etc.
        currentProgress: { type: Number, default: 0 },
        deadline: Date,
        status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
        membersInvolved: Number,
      },
    ],

    // Club Statistics
    statistics: {
      totalActivitiesPlanned: { type: Number, default: 0 },
      totalActivitiesCompleted: { type: Number, default: 0 },
      totalSubmissionsReceived: { type: Number, default: 0 },
      totalSubmissionsApproved: { type: Number, default: 0 },
      totalEcoPointsAwarded: { type: Number, default: 0 },
      averageParticipationRate: { type: Number, default: 0 }, // Percentage
      memberRetentionRate: { type: Number, default: 0 }, // Percentage
      environmentalImpactToDate: {
        treesCumulative: { type: Number, default: 0 },
        plasticCumulativeKg: { type: Number, default: 0 },
        waterCumulativeLitres: { type: Number, default: 0 },
        co2CumulativeKg: { type: Number, default: 0 },
      },
    },

    // Club Calendar
    calendar: [
      {
        eventDate: Date,
        eventTitle: String,
        eventType: { type: String, enum: ['meeting', 'activity', 'registration_deadline', 'announcement'], default: 'meeting' },
        description: String,
        relatedActivityId: mongoose.Schema.Types.ObjectId,
      },
    ],

    // Budget & Resources (Optional)
    budget: {
      allocatedBudget: { type: Number, default: 0 },
      spentBudget: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      budgetItems: [
        {
          itemName: String,
          category: String,
          estimatedCost: Number,
          actualCost: Number,
          status: { type: String, enum: ['planned', 'purchased'], default: 'planned' },
        },
      ],
    },

    // Recognition & Awards
    recognition: {
      clubAwards: [
        {
          awardName: String,
          awardDate: Date,
          issuedBy: String, // School, District, etc.
          category: String,
        },
      ],
      certifications: {
        ecoClubCertified: { type: Boolean, default: false },
        certificationDate: Date,
        certificationBody: String,
      },
    },

    // Communication & Updates
    announcements: [
      {
        announcementId: mongoose.Schema.Types.ObjectId,
        title: String,
        content: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdDate: { type: Date, default: Date.now },
        images: [String],
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      },
    ],

    // Club Status & Visibility
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'archived'],
      default: 'active',
    },
    isPublic: { type: Boolean, default: true }, // Visible to other students
    joinApprovalRequired: { type: Boolean, default: false }, // Coordinator approval needed

    // Compliance & Documentation
    compliance: {
      parentalConsentCollected: { type: Boolean, default: false },
      safetyProtocolsInPlace: { type: Boolean, default: false },
      insuranceCovered: { type: Boolean, default: false },
      lastComplianceCheck: Date,
      lastComplianceCheckedBy: mongoose.Schema.Types.ObjectId,
    },

    // Partnership & Collaborations
    partnerships: [
      {
        partnerId: mongoose.Schema.Types.ObjectId,
        partnerName: String,
        partnerType: { type: String, enum: ['ngo', 'government', 'corporate', 'educational'], default: 'ngo' },
        collaborationDetails: String,
        startDate: Date,
        endDate: Date,
        status: { type: String, enum: ['active', 'completed'], default: 'active' },
      },
    ],

    // Metadata
    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      views: { type: Number, default: 0 },
      featured: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
EcoClubSchema.index({ schoolId: 1, status: 1 });
EcoClubSchema.index({ 'leadership.coordinator.userId': 1 });
EcoClubSchema.index({ clubId: 1 });
EcoClubSchema.index({ 'membership.members.studentId': 1 });
EcoClubSchema.index({ 'metadata.createdAt': -1 });

// Methods
EcoClubSchema.methods.addMember = function (studentId, studentName, studentEmail) {
  const existingMember = this.membership.members.find(m => m.studentId.equals(studentId));
  if (!existingMember && this.membership.totalMembers < this.membership.maxCapacity) {
    this.membership.members.push({
      studentId,
      name: studentName,
      email: studentEmail,
      joinedDate: new Date(),
      role: 'member',
      status: 'active',
    });
    this.membership.totalMembers = this.membership.members.filter(m => m.status === 'active').length;
    return true;
  }
  return false;
};

EcoClubSchema.methods.removeMember = function (studentId) {
  const member = this.membership.members.find(m => m.studentId.equals(studentId));
  if (member) {
    member.status = 'inactive';
    this.membership.totalMembers = this.membership.members.filter(m => m.status === 'active').length;
    return true;
  }
  return false;
};

EcoClubSchema.methods.createActivity = function (activityData) {
  const activity = {
    activityId: new mongoose.Types.ObjectId(),
    ...activityData,
    status: 'planned',
    actualParticipants: 0,
  };
  this.activities.push(activity);
  this.statistics.totalActivitiesPlanned += 1;
  return activity;
};

EcoClubSchema.methods.completeActivity = function (activityId, actualParticipants, ecoPointsAwarded) {
  const activity = this.activities.find(a => a.activityId.equals(activityId));
  if (activity) {
    activity.status = 'completed';
    activity.actualDate = new Date();
    activity.actualParticipants = actualParticipants;
    this.statistics.totalActivitiesCompleted += 1;
    this.statistics.totalEcoPointsAwarded += ecoPointsAwarded;
    return true;
  }
  return false;
};

EcoClubSchema.methods.submitActivityForApproval = function (submissionData) {
  const submission = {
    submissionId: new mongoose.Types.ObjectId(),
    ...submissionData,
    submittedDate: new Date(),
    status: 'pending',
  };
  this.submissionQueue.push(submission);
  this.statistics.totalSubmissionsReceived += 1;
  return submission;
};

EcoClubSchema.methods.approveSubmission = function (submissionId, ecoPoints, verifiedBy, comments = '') {
  const submission = this.submissionQueue.find(s => s.submissionId.equals(submissionId));
  if (submission) {
    submission.status = 'approved';
    submission.ecoPointsAwarded = ecoPoints;
    submission.verifiedBy = verifiedBy;
    submission.verificationDate = new Date();
    submission.verificationComments = comments;
    this.statistics.totalSubmissionsApproved += 1;
    this.statistics.totalEcoPointsAwarded += ecoPoints;

    // Update member stats
    const member = this.membership.members.find(m => m.studentId.equals(submission.studentId));
    if (member) {
      member.ecoPointsEarned += ecoPoints;
      member.activitiesParticipated += 1;
    }

    return true;
  }
  return false;
};

EcoClubSchema.methods.rejectSubmission = function (submissionId, verifiedBy, rejectionReason = '') {
  const submission = this.submissionQueue.find(s => s.submissionId.equals(submissionId));
  if (submission) {
    submission.status = 'rejected';
    submission.verifiedBy = verifiedBy;
    submission.verificationDate = new Date();
    submission.verificationComments = rejectionReason;
    return true;
  }
  return false;
};

EcoClubSchema.methods.calculateParticipationRate = function () {
  if (this.statistics.totalActivitiesCompleted === 0) return 0;
  const totalParticipations = this.activities
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.actualParticipants || 0), 0);
  const possibleParticipations = this.statistics.totalActivitiesCompleted * this.membership.totalMembers;
  return Math.round((totalParticipations / possibleParticipations) * 100);
};

EcoClubSchema.methods.calculateRetentionRate = function () {
  if (this.membership.members.length === 0) return 0;
  const activeMembers = this.membership.members.filter(m => m.status === 'active').length;
  return Math.round((activeMembers / this.membership.members.length) * 100);
};

module.exports = mongoose.model('EcoClub', EcoClubSchema);
