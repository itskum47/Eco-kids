const mongoose = require('mongoose');

const RewardLedgerSchema = new mongoose.Schema({
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: [
            'EP_CREDIT',
            'EP_REVERSAL',
            'BADGE_AWARD',
            'BADGE_REVOKE',
            'MISSION_COMPLETE',
            'STREAK_BONUS'
        ],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    sourceModel: {
        type: String,
        enum: ['ActivitySubmission', 'Quiz', 'Experiment', 'Game', 'DailyHabit', 'WeeklyMission', 'System'],
        default: 'System'
    },
    reason: {
        type: String,
        maxlength: 500
    },
    processedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    reversedAt: {
        type: Date,
        default: null
    },
    reversalReason: {
        type: String,
        default: null,
        maxlength: 500
    }
});

// Compound indexes for efficient querying
RewardLedgerSchema.index({ userId: 1, processedAt: -1 });
RewardLedgerSchema.index({ sourceId: 1, sourceModel: 1 });
RewardLedgerSchema.index({ userId: 1, action: 1, processedAt: -1 });

module.exports = mongoose.model('RewardLedger', RewardLedgerSchema);
