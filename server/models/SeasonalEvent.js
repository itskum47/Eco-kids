const mongoose = require('mongoose');

const seasonalEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        required: true,
        enum: ['earth_day', 'environment_day', 'clean_air', 'water_week', 'biodiversity', 'diwali_clean', 'independence_green', 'custom']
    },
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
    bonusMultiplier: {
        type: Number,
        required: true,
        default: 2.0,
        min: 1.0,
        max: 5.0
    },
    eligibleActivityTypes: [{
        type: String,
        enum: ['tree-planting', 'waste-recycling', 'water-saving', 'energy-saving', 'plastic-reduction', 'composting', 'biodiversity-survey']
    }],
    specialBadgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    participantCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

seasonalEventSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

// Get currently active events
seasonalEventSchema.statics.getActiveEvents = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now }
    }).lean();
};

// Check if an activity type qualifies for any active bonus
seasonalEventSchema.statics.getBonusMultiplier = async function (activityType) {
    const now = new Date();
    const events = await this.find({
        isActive: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
        $or: [
            { eligibleActivityTypes: activityType },
            { eligibleActivityTypes: { $size: 0 } } // Empty = all types eligible
        ]
    }).lean();

    if (events.length === 0) return { multiplier: 1.0, event: null };

    // Use highest multiplier if multiple events overlap
    const best = events.reduce((max, e) => e.bonusMultiplier > max.bonusMultiplier ? e : max, events[0]);
    return { multiplier: best.bonusMultiplier, event: best };
};

module.exports = mongoose.model('SeasonalEvent', seasonalEventSchema);
