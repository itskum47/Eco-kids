const cron = require('node-cron');
const MonitoringService = require('../services/monitoringService');
const SystemAlert = require('../models/SystemAlert');

/**
 * PHASE 5: MONITORING SCHEDULER
 * 
 * Runs all health checks every 5 minutes
 * Logs results to SystemMetric collection
 * Creates alerts for critical issues
 */

async function startMonitoringScheduler() {
  console.log('🔄 Starting system monitoring scheduler...\n');

  // Run checks every 5 minutes
  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      const results = await MonitoringService.runAllChecks();

      // Summary
      const statuses = Object.values(results.checks).map(c => c.status);
      const hasIssues = statuses.some(s => s !== 'healthy');

      if (hasIssues) {
        console.log('⚠️ System issues detected - check alerts collection\n');
      } else {
        console.log('✅ All systems healthy\n');
      }

    } catch (error) {
      console.error('❌ Monitoring scheduler error:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Initial check on startup
  await MonitoringService.runAllChecks();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping monitoring scheduler...');
    task.stop();
    process.exit(0);
  });

  return task;
}

// Run if executed directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids';

  mongoose.connect(DB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB\n');
      startMonitoringScheduler();
    })
    .catch(err => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = { startMonitoringScheduler };
