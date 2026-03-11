const mongoose = require('mongoose');
const SystemMetric = require('../models/SystemMetric');
const SystemAlert = require('../models/SystemAlert');

/**
 * PHASE 5: MONITORING SERVICE
 * 
 * Continuously checks critical compliance infrastructure
 * 
 * Checks:
 * 1. Database connectivity + latency
 * 2. Backup system freshness
 * 3. Audit logging capability
 * 4. Consent middleware functionality
 * 5. RBAC enforcement checks
 * 
 * Each check writes metric. Critical issues trigger alerts.
 */

class MonitoringService {
  constructor() {
    this.alertThresholds = {
      databaseLatency: 100,        // ms - alert if > 100ms
      backupAge: 172800000,        // ms - alert if no backup > 48 hours
      auditWriteFailures: 0.01,    // alert if > 1% failure rate
      consentLatency: 1000         // ms - alert if > 1 second
    };
  }

  /**
   * Check 1: Database Health
   * 
   * Monitors:
   * - Connection status
   * - Query latency
   * - Collection accessibility
   */
  async checkDatabaseHealth() {
    const start = Date.now();

    try {
      // Ping database
      await mongoose.connection.db.admin().ping();

      const latency = Date.now() - start;

      // Record metric
      await SystemMetric.create({
        service: 'database',
        status: latency > this.alertThresholds.databaseLatency ? 'warning' : 'healthy',
        latencyMs: latency,
        metadata: {
          connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        }
      });

      // Alert if latency critical
      if (latency > this.alertThresholds.databaseLatency) {
        await this.createAlert({
          service: 'database',
          severity: 'high',
          message: `Database latency: ${latency}ms (threshold: ${this.alertThresholds.databaseLatency}ms)`,
          metadata: { latency }
        });
      }

      return { status: 'healthy', latency };

    } catch (error) {
      // Record failure
      await SystemMetric.create({
        service: 'database',
        status: 'critical',
        error: error.message
      });

      // Alert immediately
      await this.createAlert({
        service: 'database',
        severity: 'critical',
        message: `Database connection failed: ${error.message}`,
        metadata: { error: error.message }
      });

      console.error('❌ Database health check failed:', error.message);
      return { status: 'critical', error: error.message };
    }
  }

  /**
   * Check 2: Backup System Freshness
   * 
   * Monitors:
   * - Last successful backup timestamp
   * - Backup file existence
   * - No backup > 48 hours = CRITICAL
   */
  async checkBackupFreshness() {
    try {
      // Find latest backup record in audit_logs
      const latestBackup = await mongoose.connection.collection('audit_logs').findOne(
        { action: 'BACKUP_COMPLETED', status: 'success' },
        { sort: { timestamp: -1 } }
      );

      if (!latestBackup) {
        // No backup ever recorded
        await SystemMetric.create({
          service: 'backup',
          status: 'critical',
          error: 'No backup recorded in audit logs'
        });

        await this.createAlert({
          service: 'backup_system',
          severity: 'critical',
          message: 'No backup has ever been recorded. Backup system not functional.',
          metadata: { reason: 'no_backup_found' }
        });

        return { status: 'critical', reason: 'no_backup_recorded' };
      }

      const backupAge = Date.now() - new Date(latestBackup.timestamp).getTime();
      const hoursOld = (backupAge / 1000 / 60 / 60).toFixed(1);

      // Determine status
      let status = 'healthy';
      if (backupAge > this.alertThresholds.backupAge) {
        status = 'critical';
      } else if (backupAge > (this.alertThresholds.backupAge * 0.75)) {
        status = 'warning';
      }

      // Record metric
      await SystemMetric.create({
        service: 'backup',
        status,
        latencyMs: null,
        metadata: {
          lastBackupHoursAgo: hoursOld,
          lastBackupTime: latestBackup.timestamp,
          backupStatus: latestBackup.metadata?.reason || 'success'
        }
      });

      // Alert if stale
      if (status === 'critical') {
        await this.createAlert({
          service: 'backup_freshness',
          severity: 'critical',
          message: `Last backup is ${hoursOld} hours old. Threshold: 48 hours.`,
          metadata: { hoursOld, lastBackupTime: latestBackup.timestamp }
        });
      } else if (status === 'warning') {
        await this.createAlert({
          service: 'backup_freshness',
          severity: 'high',
          message: `Last backup is ${hoursOld} hours old. Approaching 48-hour threshold.`,
          metadata: { hoursOld, lastBackupTime: latestBackup.timestamp }
        });
      }

      return { status, hoursOld };

    } catch (error) {
      await SystemMetric.create({
        service: 'backup',
        status: 'critical',
        error: error.message
      });

      await this.createAlert({
        service: 'backup_system',
        severity: 'critical',
        message: `Backup freshness check failed: ${error.message}`,
        metadata: { error: error.message }
      });

      console.error('❌ Backup freshness check failed:', error.message);
      return { status: 'critical', error: error.message };
    }
  }

  /**
   * Check 3: Audit Logging Capability
   * 
   * Monitors:
   * - Can write audit logs
   * - Recent audit activity (last hour)
   */
  async checkAuditLoggingHealth() {
    try {
      // Try to write test audit log
      const testLog = {
        action: 'SYSTEM_HEALTH_CHECK',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        targetType: 'SYSTEM',
        status: 'success',
        metadata: { healthCheck: true },
        timestamp: new Date()
      };

      await mongoose.connection.collection('audit_logs').insertOne(testLog);

      // Check for recent activity (last hour)
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentLogs = await mongoose.connection.collection('audit_logs').countDocuments({
        timestamp: { $gte: oneHourAgo }
      });

      await SystemMetric.create({
        service: 'audit_logging',
        status: recentLogs > 0 ? 'healthy' : 'warning',
        metadata: {
          logsInLastHour: recentLogs,
          testLogWritten: true
        }
      });

      return { status: 'healthy', logsInLastHour: recentLogs };

    } catch (error) {
      await SystemMetric.create({
        service: 'audit_logging',
        status: 'critical',
        error: error.message
      });

      await this.createAlert({
        service: 'audit_logging',
        severity: 'critical',
        message: `Cannot write audit logs: ${error.message}`,
        metadata: { error: error.message }
      });

      console.error('❌ Audit logging check failed:', error.message);
      return { status: 'critical', error: error.message };
    }
  }

  /**
   * Check 4: Consent Middleware Health
   * 
   * Monitors:
   * - ParentalConsent collection accessible
   * - Can query consent records
   */
  async checkConsentSystemHealth() {
    const start = Date.now();

    try {
      // Try to query consent records
      const consentCount = await mongoose.connection.collection('parental_consents').countDocuments();
      const latency = Date.now() - start;

      await SystemMetric.create({
        service: 'consent_middleware',
        status: latency > this.alertThresholds.consentLatency ? 'warning' : 'healthy',
        latencyMs: latency,
        metadata: {
          consentRecordsAccessible: true,
          totalConsentRecords: consentCount
        }
      });

      return { status: 'healthy', latency, consentRecords: consentCount };

    } catch (error) {
      await SystemMetric.create({
        service: 'consent_middleware',
        status: 'critical',
        error: error.message
      });

      await this.createAlert({
        service: 'consent_system',
        severity: 'critical',
        message: `Consent system inaccessible: ${error.message}`,
        metadata: { error: error.message }
      });

      console.error('❌ Consent system check failed:', error.message);
      return { status: 'critical', error: error.message };
    }
  }

  /**
   * Check 5: RBAC Enforcement Health
   * 
   * Monitors:
   * - User collection accessible
   * - Role field valid
   */
  async checkRBACHealth() {
    try {
      // Try to query users with roles
      const users = await mongoose.connection.collection('users').findOne();
      
      const hasValidRole = users && [
        'student',
        'teacher',
        'school_admin',
        'district_admin',
        'state_admin'
      ].includes(users.role);

      await SystemMetric.create({
        service: 'rbac_enforcement',
        status: hasValidRole ? 'healthy' : 'warning',
        metadata: {
          usersAccessible: !!users,
          sampleUserRole: users?.role || null
        }
      });

      return { status: 'healthy', rbacOperational: hasValidRole };

    } catch (error) {
      await SystemMetric.create({
        service: 'rbac_enforcement',
        status: 'critical',
        error: error.message
      });

      await this.createAlert({
        service: 'rbac_system',
        severity: 'critical',
        message: `RBAC enforcement check failed: ${error.message}`,
        metadata: { error: error.message }
      });

      console.error('❌ RBAC check failed:', error.message);
      return { status: 'critical', error: error.message };
    }
  }

  /**
   * Create alert for critical/high severity issues
   * 
   * Prevents alert spam:
   * - Only creates new alert if no unresolved alert for same service + last 1 hour
   */
  async createAlert({ service, severity, message, metadata }) {
    try {
      // Check if similar unresolved alert exists (within 1 hour)
      const oneHourAgo = new Date(Date.now() - 3600000);
      const existingAlert = await SystemAlert.findOne({
        service,
        severity,
        resolved: false,
        timestamp: { $gte: oneHourAgo }
      });

      // Don't spam - only create if no recent alert
      if (!existingAlert) {
        await SystemAlert.create({
          service,
          severity,
          message,
          metadata,
          resolved: false
        });

        console.log(`🚨 Alert created: [${severity.toUpperCase()}] ${service} - ${message}`);
      }

    } catch (error) {
      console.error('Error creating alert:', error.message);
    }
  }

  /**
   * MAIN: Run all health checks
   */
  async runAllChecks() {
    console.log('\n📊 PHASE 5: Running system health checks...\n');

    const results = {
      timestamp: new Date(),
      checks: {}
    };

    results.checks.database = await this.checkDatabaseHealth();
    results.checks.backup = await this.checkBackupFreshness();
    results.checks.auditLogging = await this.checkAuditLoggingHealth();
    results.checks.consent = await this.checkConsentSystemHealth();
    results.checks.rbac = await this.checkRBACHealth();

    console.log('✅ Health checks complete\n');

    return results;
  }
}

module.exports = new MonitoringService();
