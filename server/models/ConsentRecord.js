const mongoose = require('mongoose');

const ConsentRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    
    consentType: {
        type: String,
        required: [true, 'Consent type is required'],
        enum: {
            values: [
                'platform_usage',
                'data_collection',
                'marketing',
                'third_party_sharing',
                'ai_processing'
            ],
            message: '{VALUE} is not a valid consent type'
        },
        index: true
    },
    
    givenAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    withdrawnAt: {
        type: Date,
        default: null
    },
    
    ipAddress: {
        type: String,
        required: [true, 'IP address is required for DPDP compliance']
    },
    
    userAgent: {
        type: String,
        required: [true, 'User agent is required for DPDP compliance']
    },
    
    consentVersion: {
        type: String,
        required: true,
        default: 'v1.0',
        validate: {
            validator: function(v) {
                return /^v\d+\.\d+$/.test(v);
            },
            message: 'Consent version must be in format v1.0'
        }
    },
    
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    
    parentConsent: {
        type: Boolean,
        default: false,
        required: true
    },
    
    metadata: {
        withdrawalReason: String,
        withdrawnBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
ConsentRecordSchema.index({ userId: 1, consentType: 1 });
ConsentRecordSchema.index({ userId: 1, isActive: 1 });
ConsentRecordSchema.index({ consentType: 1, isActive: 1 });
ConsentRecordSchema.index({ givenAt: -1 });

// Virtual for days since consent given
ConsentRecordSchema.virtual('daysSinceGiven').get(function() {
    if (!this.givenAt) return null;
    const now = new Date();
    const diff = now - this.givenAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Instance method to check if consent is still valid
ConsentRecordSchema.methods.isValid = function() {
    return this.isActive && !this.withdrawnAt;
};

// Instance method to withdraw consent
ConsentRecordSchema.methods.withdraw = async function(reason, withdrawnBy) {
    this.withdrawnAt = new Date();
    this.isActive = false;
    if (reason) {
        this.metadata.withdrawalReason = reason;
    }
    if (withdrawnBy) {
        this.metadata.withdrawnBy = withdrawnBy;
    }
    return await this.save();
};

// Static method to find active consents for a user
ConsentRecordSchema.statics.findActiveConsents = function(userId) {
    return this.find({
        userId,
        isActive: true,
        withdrawnAt: null
    }).sort({ givenAt: -1 });
};

// Static method to check if user has given specific consent
ConsentRecordSchema.statics.hasConsent = async function(userId, consentType) {
    const consent = await this.findOne({
        userId,
        consentType,
        isActive: true,
        withdrawnAt: null
    });
    return !!consent;
};

// Static method to get consent summary for user
ConsentRecordSchema.statics.getConsentSummary = async function(userId) {
    const consents = await this.find({ userId }).sort({ givenAt: -1 });
    
    const summary = {
        total: consents.length,
        active: 0,
        withdrawn: 0,
        byType: {}
    };
    
    consents.forEach(consent => {
        if (consent.isActive) {
            summary.active++;
        } else {
            summary.withdrawn++;
        }
        
        if (!summary.byType[consent.consentType]) {
            summary.byType[consent.consentType] = {
                given: false,
                givenAt: null,
                withdrawn: false,
                withdrawnAt: null
            };
        }
        
        // Track most recent consent for each type
        const current = summary.byType[consent.consentType];
        if (!current.givenAt || consent.givenAt > current.givenAt) {
            summary.byType[consent.consentType] = {
                given: consent.isActive,
                givenAt: consent.givenAt,
                withdrawn: !consent.isActive,
                withdrawnAt: consent.withdrawnAt
            };
        }
    });
    
    return summary;
};

// Pre-save hook to ensure platform_usage cannot be withdrawn once given
ConsentRecordSchema.pre('save', function(next) {
    if (this.consentType === 'platform_usage' && this.isModified('isActive') && !this.isActive) {
        const error = new Error('Platform usage consent cannot be withdrawn. User must delete account instead.');
        return next(error);
    }
    next();
});

const ConsentRecord = mongoose.model('ConsentRecord', ConsentRecordSchema);

module.exports = ConsentRecord;
