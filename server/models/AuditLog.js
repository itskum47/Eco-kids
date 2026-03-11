const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  // Legacy actor field (kept optional for backward compatibility)
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },

  // Actor (user performing the action) - optional for failed login attempts
  actorId: {
    type: String,
    required: false,
    index: true
  },
  actorRole: {
    type: String,
    default: 'system'
  },
  
  // Action being performed
  action: {
    type: String,
    required: true,
    index: true
  },
  
  // Target of the action
  targetType: {
    type: String
  },
  targetId: {
    type: String
  },
  // Legacy target field (kept optional for backward compatibility)
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Request metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  // Legacy IP field (kept optional for backward compatibility)
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Operation status
  status: {
    type: String,
    enum: ['success', 'failure', 'ongoing'],
    default: 'success'
  },
  errorMessage: {
    type: String
  },
  duration: {
    type: Number
  },
  
  // Compliance tracking
  sourceSystem: {
    type: String,
    default: 'ecokids-web'
  },
  dataClassification: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'confidential'
  },
  complianceFlags: {
    type: [String],
    default: []
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for fast querying
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
