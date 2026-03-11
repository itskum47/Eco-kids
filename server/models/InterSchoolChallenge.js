const mongoose = require('mongoose');

const interSchoolChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Challenge title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    challengeType: {
        type: String,
        required: true,
        enum: ['eco_points', 'activities', 'quizzes'],
        default: 'eco_points'
    },
    targetMetric: {
        type: String,
        default: 'eco_points_total'
    },
    schools: [{
        schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        schoolName: String,
        totalScore: { type: Number, default: 0 },
        participantCount: { type: Number, default: 0 }
    }],
    startsAt: {
        type: Date,
        required: true,
        index: true
    },
    endsAt: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'cancelled'],
        default: 'draft',
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    results: {
        rankings: [{
            rank: Number,
            schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
            schoolName: String,
            totalScore: Number
        }],
        computedAt: Date
    },
    rules: {
        minParticipants: { type: Number, default: 5 },
        maxSchools: { type: Number, default: 20 },
        pointsMultiplier: { type: Number, default: 1 }, // Multiplier for points (e.g., 2x points week)
        difficultyTier: { 
            type: String, 
            enum: ['easy', 'medium', 'hard', 'extreme'],
            default: 'medium'
        },
        bonusConditions: [{
            condition: String, // e.g., 'first_to_100', 'daily_streak_7'
            bonusPoints: Number,
            description: String
        }],
        timeBonuses: [{
            startHour: Number, // e.g., 18 (6 PM)
            endHour: Number,   // e.g., 20 (8 PM)
            multiplier: Number, // e.g., 1.5 (50% bonus during peak hours)
            description: String
        }]
    }
}, {
    timestamps: true
});

interSchoolChallengeSchema.index({ status: 1, startsAt: 1 });
interSchoolChallengeSchema.index({ 'schools.schoolId': 1 });

// Get active challenges
interSchoolChallengeSchema.statics.getActive = function () {
    const now = new Date();
    return this.find({
        status: 'active',
        startsAt: { $lte: now },
        endsAt: { $gte: now }
    }).lean();
};

module.exports = mongoose.model('InterSchoolChallenge', interSchoolChallengeSchema);
