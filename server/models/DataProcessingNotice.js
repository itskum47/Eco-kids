const mongoose = require('mongoose');

const dataProcessingNoticeSchema = new mongoose.Schema({
    version: {
        type: String,
        required: [true, 'Notice version is required'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Notice title is required'],
        trim: true
    },
    purpose: {
        type: String,
        required: [true, 'Processing purpose is required'],
        enum: [
            'core_platform',          // Essential platform operation
            'gamification',           // Points, badges, leaderboards
            'analytics',              // Usage analytics
            'notifications',          // Push, email, SMS
            'environmental_impact',   // Impact tracking and reporting
            'content_personalization' // Grade-level content filtering
        ]
    },
    legalBasis: {
        type: String,
        required: [true, 'Legal basis is required'],
        enum: [
            'consent',                 // User gave explicit consent
            'legitimate_interest',     // Platform operation necessity
            'legal_obligation',        // Required by Indian law
            'performance_of_contract'  // Service delivery
        ]
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    dataCategories: [{
        type: String,
        enum: [
            'identity',        // Name, email, school
            'academic',        // Grade, class, performance
            'behavioral',      // Activity logs, engagement
            'environmental',   // Eco-actions, impact data
            'media',           // Photos, videos submitted
            'location',        // Geo-tagged submissions
            'device'           // Device info, IP address
        ]
    }],
    retentionPeriodDays: {
        type: Number,
        required: true,
        default: 730 // 2 years per DPDP Act
    },
    thirdPartySharing: [{
        processor: { type: String, required: true },
        purpose: { type: String, required: true },
        dataTransferred: [{ type: String }],
        location: { type: String, default: 'India' }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    supersededBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DataProcessingNotice',
        default: null
    }
}, {
    timestamps: true
});

dataProcessingNoticeSchema.index({ purpose: 1, isActive: 1 });
dataProcessingNoticeSchema.index({ version: 1 }, { unique: true });

// Get all active notices
dataProcessingNoticeSchema.statics.getActiveNotices = function () {
    return this.find({ isActive: true }).sort({ purpose: 1 }).lean();
};

module.exports = mongoose.model('DataProcessingNotice', dataProcessingNoticeSchema);
