const mongoose = require('mongoose');

const objectiveSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['submit_activity', 'complete_quiz', 'complete_experiment', 'play_game', 'login', 'earn_ep'],
        required: true
    },
    activityType: {
        type: String,
        default: null
    },
    target: {
        type: Number,
        required: true,
        min: 1
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    }
}, { _id: true });

const WeeklyMissionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    icon: {
        type: String,
        default: '🎯'
    },
    type: {
        type: String,
        enum: ['individual', 'school', 'district'],
        default: 'individual'
    },
    objectives: {
        type: [objectiveSchema],
        required: true,
        validate: [arr => arr.length >= 1 && arr.length <= 5, 'Mission must have 1-5 objectives']
    },
    reward: {
        ep: { type: Number, required: true, min: 1 },
        badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: null },
        badgeName: { type: String, default: null }
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    weekNumber: {
        type: Number,
        required: true,
        index: true
    },
    year: {
        type: Number,
        required: true,
        index: true
    },
    startsAt: {
        type: Date,
        required: true,
        index: true
    },
    endsAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

WeeklyMissionSchema.index({ weekNumber: 1, year: 1 });
WeeklyMissionSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

module.exports = mongoose.model('WeeklyMission', WeeklyMissionSchema);
