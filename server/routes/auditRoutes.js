const express = require('express');
const {
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByAction,
  getAuditLogsByTarget,
  generateAuditReport,
  getAuditLogById,
  getAuditStats,
  searchAuditLogs
} = require('../controllers/auditController');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All audit routes require authentication
router.use(protect);

/**
 * Admin and State Admin only routes
 * Audit logs are restricted to administrative access
 */

// Get all audit logs (paginated, filtered) - district_admin and above
router.get('/logs', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getAuditLogs);

// Get audit logs by specific actor/user - authenticated users only
router.get('/logs/user/:actorId', getAuditLogsByUser);

// Get audit logs by action - district_admin and above
router.get('/logs/action/:action', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getAuditLogsByAction);

// Get audit logs by target entity - district_admin and above
router.get('/logs/target/:targetType/:targetId', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getAuditLogsByTarget);

// Get specific audit log by ID - district_admin and above
router.get('/logs/:id', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getAuditLogById);

// Generate compliance audit report - state_admin only
router.get('/report', requireRole(ROLES.STATE_ADMIN), generateAuditReport);

// Get audit statistics - district_admin and above
router.get('/stats', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), getAuditStats);

// Advanced search - district_admin and above
router.post('/search', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), searchAuditLogs);

module.exports = router;
