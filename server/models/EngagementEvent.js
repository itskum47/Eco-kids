const mongoose = require('mongoose');

const engagementEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    event: {
        type: String,
        required: true,
        enum: [
            'registration',
            'first_login',
            'first_activity',
            'first_quiz',
            'first_badge',
            'day_7_retention',
            'day_30_retention',
            'streak_started',
            'streak_broken',
            'level_up',
            'mission_completed',
            'challenge_joined',
            'data_export',
            'settings_change'
        ],
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    sessionId: String,
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

engagementEventSchema.index({ event: 1, createdAt: -1 });
engagementEventSchema.index({ userId: 1, event: 1 });

// Get funnel conversion rates
engagementEventSchema.statics.getFunnelMetrics = async function (dateFrom, dateTo) {
    const filter = {};
    if (dateFrom && dateTo) {
        filter.createdAt = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
    }

    const stages = ['registration', 'first_login', 'first_activity', 'first_quiz', 'day_7_retention', 'day_30_retention'];
    const results = {};

    for (const stage of stages) {
        results[stage] = await this.countDocuments({ ...filter, event: stage });
    }

    // Calculate conversion rates
    const funnel = stages.map((stage, i) => ({
        stage,
        count: results[stage],
        conversionRate: i === 0 ? 100 : (results[stages[0]] > 0
            ? ((results[stage] / results[stages[0]]) * 100).toFixed(1)
            : 0)
    }));

    return funnel;
};

module.exports = mongoose.model('EngagementEvent', engagementEventSchema);
