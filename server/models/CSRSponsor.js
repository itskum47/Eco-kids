const mongoose = require('mongoose');

const csrSponsorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logoUrl: String,
    website: String,
    contactEmail: String,
    contactPerson: String,
    sector: { type: String, enum: ['corporate', 'ngo', 'government', 'foundation'], required: true },
    isActive: { type: Boolean, default: true },
    totalFunding: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    metrics: {
        challengesSponsored: { type: Number, default: 0 },
        studentsReached: { type: Number, default: 0 },
        activitiesCompleted: { type: Number, default: 0 },
        co2Prevented: { type: Number, default: 0 },
        treesPlanted: { type: Number, default: 0 },
    },
}, { timestamps: true });

const sponsoredChallengeSchema = new mongoose.Schema({
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'CSRSponsor', required: true },
    title: { type: String, required: true },
    description: String,
    activityType: { type: String, required: true },
    targetSchools: [{ type: mongoose.Schema.Types.ObjectId, ref: 'School' }],
    targetDistricts: [String],
    targetStates: [String],
    rewardBudgetPaise: { type: Number, default: 0 },
    pointsPerActivity: { type: Number, default: 10 },
    maxParticipants: Number,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft' },
    metrics: {
        totalSubmissions: { type: Number, default: 0 },
        approvedSubmissions: { type: Number, default: 0 },
        pointsAwarded: { type: Number, default: 0 },
        uniqueParticipants: { type: Number, default: 0 },
    },
    attribution: {
        showOnLeaderboard: { type: Boolean, default: true },
        showOnSubmission: { type: Boolean, default: true },
        badgeIcon: String,
        tagline: String,
    },
}, { timestamps: true });

sponsoredChallengeSchema.index({ status: 1, startDate: 1, endDate: 1 });
sponsoredChallengeSchema.index({ sponsor: 1, status: 1 });

module.exports = {
    CSRSponsor: mongoose.model('CSRSponsor', csrSponsorSchema),
    SponsoredChallenge: mongoose.model('SponsoredChallenge', sponsoredChallengeSchema),
};
