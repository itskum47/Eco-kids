const mongoose = require('mongoose');

const fraudFlagSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivitySubmission',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    flagType: {
        type: String,
        required: true,
        enum: [
            'duplicate_image',       // Same pHash found across students
            'invalid_geo',           // GPS accuracy too low or missing
            'rate_limit_exceeded',   // Too many submissions in window
            'suspicious_timing',     // EXIF mismatch with submission time
            'manual'                 // Flagged by teacher or admin
        ],
        index: true
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
        default: 0.8
    },
    details: {
        type: String,
        default: ''
    },
    matchedSubmissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivitySubmission'
    }],
    resolution: {
        type: String,
        enum: ['pending', 'dismissed', 'confirmed', 'escalated'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

fraudFlagSchema.index({ resolution: 1, createdAt: -1 });
fraudFlagSchema.index({ userId: 1, flagType: 1 });
fraudFlagSchema.index({ submissionId: 1, flagType: 1 });

// Get pending fraud flags with pagination
fraudFlagSchema.statics.getPendingFlags = function (page = 1, limit = 20) {
    return this.find({ resolution: 'pending' })
        .sort({ confidence: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('submissionId', 'activityType evidence status createdAt')
        .populate('userId', 'name email profile.school')
        .populate('reviewedBy', 'name')
        .lean();
};

// Count pending flags
fraudFlagSchema.statics.countPending = function () {
    return this.countDocuments({ resolution: 'pending' });
};

// Get flag summary by type
fraudFlagSchema.statics.getSummary = async function () {
    return this.aggregate([
        {
            $group: {
                _id: { flagType: '$flagType', resolution: '$resolution' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.flagType': 1, '_id.resolution': 1 } }
    ]);
};

module.exports = mongoose.model('FraudFlag', fraudFlagSchema);
