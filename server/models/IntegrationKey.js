const mongoose = require('mongoose');

const IntegrationKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    organization: {
        type: String,
        required: true,
        trim: true,
    },
    apiKeyHash: {
        type: String,
        required: true,
        unique: true
    },
    scope: {
        type: String,
        required: true,
        enum: ['national', 'state', 'district'],
        default: 'state'
    },
    state: {
        type: String,
        required: function () {
            return this.scope === 'state' || this.scope === 'district';
        }
    },
    district: {
        type: String,
        required: function () {
            return this.scope === 'district';
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsedAt: {
        type: Date
    }
}, { timestamps: true });

// Optimize query patterns where we look up by hash
IntegrationKeySchema.index({ apiKeyHash: 1 });
IntegrationKeySchema.index({ isActive: 1 });

module.exports = mongoose.model('IntegrationKey', IntegrationKeySchema);
