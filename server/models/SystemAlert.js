const mongoose = require('mongoose');

/**
 * PHASE 5: OPERATIONAL ALERTING
 * 
 * SystemAlert creates permanent audit trail of all alerts
 * 
 * Purpose: Visible proof that system detected and reported issues
 * 
 * Auditor question: "How do you know if monitoring broke?"
 * Answer: "Every alert is stored in MongoDB with timestamp and resolution"
 * 
 * Compliance requirement: Silent monitoring is useless
 * Visible alerting is compliance-grade
 */

const systemAlertSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    index: true,
    enum: [
      'backup_system',      // Backup didn't run, upload failed
      'database',           // Connection lost, latency critical
      'audit_logging',      // Cannot write audit logs
      'consent_system',     // Middleware failing
      'rbac_system',        // Access control failures
      'backup_freshness'    // No backup in last 48 hours
    ]
  },

  severity: {
    type: String,
    enum: ['critical', 'high', 'medium'],
    required: true,
    index: true
  },

  message: {
    type: String,
    required: true
  },

  // Additional diagnostic info
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Is this alert resolved?
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },

  // When was it resolved?
  resolvedAt: {
    type: Date,
    default: null
  },

  // Who/what resolved it?
  resolvedBy: {
    type: String,
    default: null
  },

  // Alert fire time
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for finding unresolved alerts
systemAlertSchema.index({ service: 1, resolved: 1 });
systemAlertSchema.index({ severity: 1, resolved: 1 });

// Auto-delete resolved alerts after 90 days (compliance window)
systemAlertSchema.index(
  { resolvedAt: 1 },
  { 
    expireAfterSeconds: 7776000,  // 90 days
    partialFilterExpression: { resolved: true }
  }
);

module.exports = mongoose.model('SystemAlert', systemAlertSchema);
