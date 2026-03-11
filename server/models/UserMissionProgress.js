const mongoose = require('mongoose');

const objectiveProgressSchema = new mongoose.Schema({
    objectiveId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    current: {
        type: Number,
        default: 0,
        min: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { _id: false });

const UserMissionProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    missionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WeeklyMission',
        required: true,
        index: true
    },
    objectives: [objectiveProgressSchema],
    allObjectivesCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    rewardClaimed: {
        type: Boolean,
        default: false
    },
    rewardClaimedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate progress entries
UserMissionProgressSchema.index({ userId: 1, missionId: 1 }, { unique: true });

// Pre-save: check if all objectives are completed
UserMissionProgressSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    if (this.objectives.length > 0) {
        this.allObjectivesCompleted = this.objectives.every(obj => obj.completed);
        if (this.allObjectivesCompleted && !this.completedAt) {
            this.completedAt = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('UserMissionProgress', UserMissionProgressSchema);
