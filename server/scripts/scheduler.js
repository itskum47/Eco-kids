#!/usr/bin/env node

/**
 * PHASE 4: AUTOMATED BACKUP SCHEDULER
 * 
 * Purpose: Run daily automated backups at 2 AM UTC
 * 
 * Usage:
 *   node scripts/scheduler.js
 * 
 * This script should run as a background process:
 *   - In production: Use PM2, systemd, or Docker container
 *   - In development: Run manually or use npm script
 * 
 * Production deployment options:
 * 
 * 1. PM2 (recommended):
 *    pm2 start scripts/scheduler.js --name "backup-scheduler"
 *    pm2 save
 * 
 * 2. Systemd service:
 *    Create /etc/systemd/system/ecokids-backup.service
 * 
 * 3. Docker container:
 *    Run as sidecar container with shared MongoDB access
 * 
 * 4. Kubernetes CronJob:
 *    Create CronJob resource with schedule: "0 2 * * *"
 * 
 * Compliance requirement:
 * - Daily backups are mandatory for RTE Act 2009 and POCSO Act 2012
 * - Backup schedule must be documented and verifiable
 * - Missed backups must be logged and alerted
 */

require('dotenv').config();
const cron = require('node-cron');
const backupService = require('../services/backupService');

// Backup schedule configuration
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || '0 2 * * *'; // Default: 2 AM UTC daily
const TIMEZONE = process.env.BACKUP_TIMEZONE || 'UTC';

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║   PHASE 4: AUTOMATED BACKUP SCHEDULER                 ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');
console.log(`Schedule: ${BACKUP_SCHEDULE} (${TIMEZONE})`);
console.log(`Next backup: ${getNextBackupTime()}\n`);

// Validate cron expression
if (!cron.validate(BACKUP_SCHEDULE)) {
  console.error('❌ Invalid BACKUP_SCHEDULE cron expression:', BACKUP_SCHEDULE);
  console.error('Example: "0 2 * * *" (daily at 2 AM UTC)\n');
  process.exit(1);
}

// Track backup execution
let lastBackupTime = null;
let lastBackupStatus = null;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Execute scheduled backup
 */
async function executeScheduledBackup() {
  const timestamp = new Date().toISOString();

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   SCHEDULED BACKUP EXECUTION                          ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`Triggered: ${timestamp}\n`);

  try {
    const result = await backupService.executeBackup('SYSTEM', 'Scheduled daily backup');

    lastBackupTime = new Date();
    lastBackupStatus = 'SUCCESS';
    consecutiveFailures = 0;

    console.log('\n✅ Scheduled backup completed successfully');
    console.log(`Next backup: ${getNextBackupTime()}\n`);

    return result;

  } catch (error) {
    lastBackupTime = new Date();
    lastBackupStatus = 'FAILED';
    consecutiveFailures++;

    console.error('\n❌ Scheduled backup failed');
    console.error(`Error: ${error.message}`);
    console.error(`Consecutive failures: ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}\n`);

    // Alert if too many consecutive failures
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error('🚨 CRITICAL: Multiple consecutive backup failures detected!');
      console.error('🚨 This is a compliance risk - immediate attention required!\n');

      // Send alert email/SMS to administrators
      // Trigger monitoring system alert
    }

    throw error;
  }
}

/**
 * Get next scheduled backup time
 */
function getNextBackupTime() {
  // This is a simplified version - cron library doesn't provide easy next-execution calculation
  // In production, use a more sophisticated library like cron-parser
  return 'Daily at 2:00 AM UTC (configured in BACKUP_SCHEDULE)';
}

/**
 * Health check endpoint data
 */
function getSchedulerHealth() {
  return {
    status: consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ? 'CRITICAL' : 'OK',
    schedule: BACKUP_SCHEDULE,
    timezone: TIMEZONE,
    lastBackupTime,
    lastBackupStatus,
    consecutiveFailures,
    uptime: process.uptime()
  };
}

// Schedule the backup job
console.log('⏰ Scheduling automated backup job...');

const scheduledTask = cron.schedule(BACKUP_SCHEDULE, async () => {
  await executeScheduledBackup();
}, {
  scheduled: true,
  timezone: TIMEZONE
});

console.log('✅ Backup scheduler started successfully');
console.log(`📅 Schedule: ${BACKUP_SCHEDULE}`);
console.log(`🌍 Timezone: ${TIMEZONE}`);
console.log(`🔄 Status: Running`);
console.log(`📊 Health: http://localhost:5001/api/backup/health\n`);

// Optional: Execute immediate backup on startup (for testing)
if (process.env.BACKUP_ON_STARTUP === 'true') {
  console.log('🚀 Executing startup backup (BACKUP_ON_STARTUP=true)...\n');

  executeScheduledBackup().catch(error => {
    console.error('❌ Startup backup failed:', error.message);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down backup scheduler...');
  scheduledTask.stop();
  console.log('✅ Backup scheduler stopped gracefully\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down backup scheduler (SIGTERM)...');
  scheduledTask.stop();
  console.log('✅ Backup scheduler stopped gracefully\n');
  process.exit(0);
});

// Keep process alive
console.log('💚 Scheduler is running. Press Ctrl+C to stop.\n');

// Optional: Export health check function for HTTP endpoint
module.exports = {
  getSchedulerHealth,
  executeScheduledBackup
};
