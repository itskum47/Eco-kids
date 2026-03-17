const mongoose = require('mongoose');

const ApprovalAuditLogSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null // null when action_source = 'ai_auto'
  },
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivitySubmission',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['approved', 'rejected'],
    required: true
  },
  action_source: {
    type: String,
    enum: ['teacher', 'ai_auto'],
    default: 'teacher'
  },
  ip_address: {
    type: String,
    trim: true
  },
  session_id: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false,
  collection: 'approval_audit_logs'
});

ApprovalAuditLogSchema.index({ teacher_id: 1, timestamp: -1 });
ApprovalAuditLogSchema.index({ submission_id: 1, action_source: 1 });

module.exports = mongoose.model('ApprovalAuditLog', ApprovalAuditLogSchema);
