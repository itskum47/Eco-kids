const AuditLog = require('../models/AuditLog');

/**
 * Production-grade audit logger for ISO 27001 and government compliance
 * Logs critical events without blocking main application logic
 */

/**
 * Main audit logging function
 * @param {Object} params - Logging parameters
 * @param {string} params.actorId - User ID (required)
 * @param {string} params.actorRole - User role (required)
 * @param {string} params.action - Action name (required)
 * @param {string} params.targetType - Type of target entity
 * @param {string} params.targetId - ID of target entity
 * @param {Object} params.metadata - Additional metadata
 * @param {Object} params.req - Express request object
 * @param {string} params.status - Operation status (success/failure/ongoing)
 * @param {string} params.errorMessage - Error message if status is failure
 * @param {number} params.duration - Operation duration in ms
 * @param {string} params.sourceSystem - Source system identifier
 * @param {string} params.dataClassification - Data classification level
 * @param {Array} params.complianceFlags - Applicable compliance standards
 * @returns {Promise<void>}
 */
const logAuditEvent = async (params) => {
  try {
    const {
      actorId = null,
      actorRole = 'system',
      action = null,
      targetType = null,
      targetId = null,
      metadata = {},
      req = null,
      status = 'success',
      errorMessage = null,
      duration = null,
      sourceSystem = 'ecokids-web',
      dataClassification = 'confidential',
      complianceFlags = []
    } = params;

    // Validate required fields - actorId can be null for failed login attempts
    if (!action) {
      console.warn('[AuditLogger] Missing required field: action', { actorId, action });
      return;
    }

    const ipAddress = extractIpAddress(req);
    const userAgent = req?.headers?.['user-agent'] || 'Unknown';

    // Sanitize metadata to prevent injection
    const sanitizedMetadata = sanitizeMetadata(metadata);

    // Create audit log document
    const auditLogData = {
      actorId: actorId ? String(actorId) : null,
      actorRole,
      action: String(action).toUpperCase(),
      targetType,
      targetId: targetId ? String(targetId) : null,
      metadata: sanitizedMetadata,
      ipAddress,
      userAgent,
      status,
      errorMessage: status === 'failure' ? errorMessage : null,
      duration,
      sourceSystem,
      dataClassification,
      complianceFlags: complianceFlags.length > 0 ? complianceFlags : []
    };

    // Save to MongoDB asynchronously without blocking
    AuditLog.create(auditLogData).catch((err) => {
      console.error('[AuditLogger] Failed to save audit log:', {
        action,
        actorId,
        error: err.message
      });
      // Fail silently - do not crash the application
    });

  } catch (error) {
    console.error('[AuditLogger] Unexpected error during audit logging:', {
      error: error.message,
      stack: error.stack
    });
    // Fail silently
  }
};

/**
 * Extract IP address from request object
 * Handles proxy headers (X-Forwarded-For, CF-Connecting-IP, etc.)
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
const extractIpAddress = (req) => {
  if (!req) return null;

  // Check common proxy headers in order of priority
  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can contain comma-separated IPs; take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const cfConnectingIp = req.headers?.['cf-connecting-ip'];
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = req.headers?.['x-real-ip'];
  if (xRealIp) return xRealIp;

  // Fallback to direct connection IP
  return req.ip || req.socket?.remoteAddress || null;
};

/**
 * Sanitize metadata to prevent injection attacks and PII leakage
 * @param {Object} metadata - Raw metadata object
 * @returns {Object} Sanitized metadata
 */
const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const sanitized = {};
  const blockedKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
    'pan',
    'aadhar',
    'privateKey'
  ];

  for (const [key, value] of Object.entries(metadata)) {
    // Skip blocked keys
    if (blockedKeys.some(blocked => key.toLowerCase().includes(blocked.toLowerCase()))) {
      continue;
    }

    // Sanitize strings to prevent injection
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitize string to prevent injection attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // Remove null bytes
  str = str.replace(/\0/g, '');

  // Limit string length
  if (str.length > 1000) {
    str = str.substring(0, 1000) + '...[truncated]';
  }

  return str;
};

/**
 * Log user authentication event
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {string} action - Action (LOGIN, LOGOUT, LOGIN_FAILED)
 * @param {Object} req - Express request object
 * @param {Object} metadata - Additional metadata
 */
const logAuthEvent = async (userId, userRole, action, req, metadata = {}) => {
  await logAuditEvent({
    actorId: userId,
    actorRole: userRole,
    action,
    targetType: 'USER',
    targetId: userId,
    metadata,
    req,
    complianceFlags: ['RTE_ACT_2009']
  });
};

/**
 * Log consent-related event
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {string} action - Action (CONSENT_GRANTED, CONSENT_REVOKED, etc.)
 * @param {Object} req - Express request object
 * @param {Object} metadata - Consent details
 */
const logConsentEvent = async (userId, userRole, action, req, metadata = {}) => {
  await logAuditEvent({
    actorId: userId,
    actorRole: userRole,
    action,
    targetType: 'CONSENT',
    metadata,
    req,
    complianceFlags: ['RTE_ACT_2009', 'PDP_BILL_2023', 'POCSO_ACT_2012']
  });
};

/**
 * Log task/submission-related event
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {string} action - Action (TASK_SUBMITTED, TASK_APPROVED, etc.)
 * @param {string} taskId - Task ID
 * @param {Object} req - Express request object
 * @param {Object} metadata - Task details
 */
const logTaskEvent = async (userId, userRole, action, taskId, req, metadata = {}) => {
  await logAuditEvent({
    actorId: userId,
    actorRole: userRole,
    action,
    targetType: 'TASK',
    targetId: taskId,
    metadata,
    req
  });
};

/**
 * Log data access event
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {string} action - Action (DATA_EXPORT, DATA_ACCESS, etc.)
 * @param {Object} req - Express request object
 * @param {Object} metadata - Access details
 */
const logDataAccessEvent = async (userId, userRole, action, req, metadata = {}) => {
  await logAuditEvent({
    actorId: userId,
    actorRole: userRole,
    action,
    targetType: 'DATA_EXPORT',
    metadata,
    req,
    dataClassification: 'restricted',
    complianceFlags: ['SPDI_RULES_2011', 'ISO_27001']
  });
};

/**
 * Log admin action
 * @param {string} adminId - Admin user ID
 * @param {string} action - Action name
 * @param {string} targetType - Type of target (USER, SCHOOL, DISTRICT, etc.)
 * @param {string} targetId - ID of target
 * @param {Object} req - Express request object
 * @param {Object} metadata - Action details
 */
const logAdminAction = async (adminId, action, targetType, targetId, req, metadata = {}) => {
  await logAuditEvent({
    actorId: adminId,
    actorRole: 'system',
    action,
    targetType,
    targetId,
    metadata,
    req,
    dataClassification: 'restricted',
    complianceFlags: ['SPDI_RULES_2011']
  });
};

module.exports = {
  logAuditEvent,
  logAuthEvent,
  logConsentEvent,
  logTaskEvent,
  logDataAccessEvent,
  logAdminAction,
  extractIpAddress,
  sanitizeMetadata,
  sanitizeString
};
