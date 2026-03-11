const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SystemMetric = require('../models/SystemMetric');
const SystemAlert = require('../models/SystemAlert');

/**
 * PHASE 5: HEALTH & METRICS ENDPOINTS
 * 
 * GET /api/health     - Simple health status (required by auditors)
 * GET /api/metrics    - Prometheus format metrics (future-proof)
 * 
 * NO AUTHENTICATION - External monitoring services must access
 */

/**
 * GET /api/health
 * 
 * Simple health check - returns status immediately
 * Used by:
 * - Load balancers (health probe)
 * - Monitoring systems (external)
 * - Government auditors (compliance check)
 * 
 * Response: { status: "healthy", timestamp: "2024-02-22T15:30:00Z" }
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    let mongodb = 'disconnected';
    let redis = 'disconnected';
    let queue = 'unavailable';
    let storage = 'not_configured';

    // Check MongoDB
    try {
      await mongoose.connection.db.admin().ping();
      mongodb = 'connected';
    } catch (_) {}

    // Check Redis
    try {
      const { redisClient } = require('../services/cacheService');
      const pong = await redisClient.ping();
      redis = pong === 'PONG' ? 'connected' : 'disconnected';
    } catch (_) {}

    // Check BullMQ Queue
    try {
      const { getQueueStatus } = require('../workers/gamificationWorker');
      if (typeof getQueueStatus === 'function') {
        const status = await getQueueStatus();
        queue = status?.ok ? 'healthy' : 'degraded';
      }
    } catch (_) {}

    // Check Storage (Cloudinary or placeholder)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      storage = 'cloudinary_configured';
    }

    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const elapsed = Date.now() - startTime;

    res.status(200).json({
      status: mongodb === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        mongodb,
        redis,
        queue,
        storage
      },
      uptime: `${Math.floor(uptime / 60)} minutes`,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`
      },
      responseTime: `${elapsed}ms`
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /api/metrics
 * 
 * Prometheus-compatible metrics format
 * Used by: Grafana, Prometheus, monitoring dashboards
 * 
 * Future-proofs the system for enterprise deployment
 * 
 * Exports:
 * - System health gauge (1=healthy, 2=warning, 3=critical)
 * - Latency histogram
 * - Alert counts by severity
 */
router.get('/metrics', async (req, res) => {
  try {
    // Fetch latest metrics for each service
    const latestMetrics = await SystemMetric.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: '$service',
        service: { $first: '$service' },
        status: { $first: '$status' },
        latencyMs: { $first: '$latencyMs' },
        timestamp: { $first: '$timestamp' }
      }}
    ]);

    // Fetch alert counts by severity
    const criticalAlerts = await SystemAlert.countDocuments({
      severity: 'critical',
      resolved: false
    });
    const highAlerts = await SystemAlert.countDocuments({
      severity: 'high',
      resolved: false
    });
    const mediumAlerts = await SystemAlert.countDocuments({
      severity: 'medium',
      resolved: false
    });

    // Convert status to numeric gauge (1=healthy, 2=warning, 3=critical)
    const statusGauge = {
      'healthy': 1,
      'warning': 2,
      'critical': 3
    };

    // Build Prometheus-format response
    let metrics = `# HELP ecokids_system_health System health status (1=healthy, 2=warning, 3=critical)
# TYPE ecokids_system_health gauge
`;

    latestMetrics.forEach(metric => {
      const gaugeValue = statusGauge[metric.status] || 0;
      metrics += `ecokids_system_health{service="${metric.service}"} ${gaugeValue}\n`;
    });

    metrics += `\n# HELP ecokids_system_latency_ms System latency in milliseconds
# TYPE ecokids_system_latency_ms gauge
`;

    latestMetrics.forEach(metric => {
      if (metric.latencyMs !== null && metric.latencyMs !== undefined) {
        metrics += `ecokids_system_latency_ms{service="${metric.service}"} ${metric.latencyMs}\n`;
      }
    });

    metrics += `\n# HELP ecokids_alerts_unresolved_total Total unresolved alerts by severity
# TYPE ecokids_alerts_unresolved_total gauge
ecokids_alerts_unresolved_total{severity="critical"} ${criticalAlerts}
ecokids_alerts_unresolved_total{severity="high"} ${highAlerts}
ecokids_alerts_unresolved_total{severity="medium"} ${mediumAlerts}
`;

    // Set Prometheus content type
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(metrics);

  } catch (error) {
    res.status(500).send(`# ERROR\n# Error: ${error.message}\n`);
  }
});

/**
 * GET /api/health/status
 * 
 * Detailed status (for auditors)
 * Returns: Full status of all systems with latest metrics
 */
router.get('/status', async (req, res) => {
  try {
    // Get latest metrics for each service
    const latestMetrics = await SystemMetric.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: '$service',
        status: { $first: '$status' },
        latencyMs: { $first: '$latencyMs' },
        error: { $first: '$error' },
        metadata: { $first: '$metadata' },
        timestamp: { $first: '$timestamp' }
      }}
    ]);

    // Get unresolved alerts
    const unresolved = await SystemAlert.find({
      resolved: false
    }).sort({ timestamp: -1 }).limit(10);

    res.status(200).json({
      timestamp: new Date().toISOString(),
      overallStatus: latestMetrics.every(m => m.status === 'healthy') ? 'healthy' : 'degraded',
      services: latestMetrics,
      recentUnresolvedAlerts: unresolved
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/alerts
 * 
 * For auditors: List all recent alerts with resolution status
 * Query params: ?resolved=false&severity=critical&limit=50
 */
router.get('/alerts', async (req, res) => {
  try {
    const filter = {};

    if (req.query.resolved !== undefined) {
      filter.resolved = req.query.resolved === 'true';
    }

    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);

    const alerts = await SystemAlert
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({
      count: alerts.length,
      alerts
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
