const mongoose = require('mongoose');

/**
 * PHASE 5: OPERATIONAL MONITORING
 * 
 * SystemMetric tracks real-time health of critical services
 * 
 * Purpose: Prevent silent failures in compliance systems
 * 
 * Historical records enable auditor queries:
 * - "Show me backup health for last 30 days"
 * - "When did consent system last fail?"
 * - "What was database latency pattern?"
 */

const systemMetricSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    index: true,
    enum: [
      'database',           // MongoDB connectivity + latency
      'backup',             // Backup job status + timing
      'audit_logging',      // Audit write success rate
      'consent_middleware', // Consent check latency
      'rbac_enforcement'    // Role-based access checks
    ]
  },

  status: {
    type: String,
    enum: ['healthy', 'warning', 'critical'],
    required: true,
    index: true
  },

  // Latency in milliseconds (for performance monitoring)
  latencyMs: {
    type: Number,
    default: null
  },

  // Error message if status is not healthy
  error: {
    type: String,
    default: null
  },

  // Additional context for specific services
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Auto-delete metrics older than 30 days (compliance retention)
systemMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('SystemMetric', systemMetricSchema);
