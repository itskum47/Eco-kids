const mongoose = require('mongoose');

const AdminAuditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return this.action !== 'INTEGRATION_ACCESS'; },
        index: true
    },
    organization: {
        type: String,
        required: function () { return this.action === 'INTEGRATION_ACCESS'; }
    },
    action: {
        type: String,
        required: true,
        enum: [
            'VIEW_DASHBOARD',
            'VIEW_STUDENTS',
            'VIEW_TEACHERS',
            'VIEW_IMPACT',
            'EXPORT_DATA',
            'SYSTEM_CONFIG_CHANGE',
            'INTEGRATION_ACCESS'
        ]
    },
    resourceScope: {
        type: String,
        required: true
        // e.g. "school:Springfield Elementary"
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1y' } // Keep audit logs for 1 year
    }
});

module.exports = mongoose.model('AdminAuditLog', AdminAuditLogSchema);
