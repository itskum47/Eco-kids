const { logAuditEvent } = require('../utils/auditLogger');
const { ROLES } = require('../constants/roles');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based authorization on protected endpoints
 * 
 * Usage:
 * router.post('/admin/users', protect, requireRole(ROLES.ADMIN, ROLES.STATE_ADMIN), createUser);
 * router.get('/teacher/dashboard', protect, requireRole(ROLES.TEACHER), getTeacherDashboard);
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const userId = req.user.id;
      const endpoint = req.originalUrl;
      const method = req.method;

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        // Log access denial for audit trail
        await logAuditEvent({
          actorId: userId,
          actorRole: userRole,
          action: 'ACCESS_DENIED_INSUFFICIENT_ROLE',
          targetType: 'SYSTEM',
          targetId: null,
          metadata: {
            endpoint,
            method,
            requiredRoles: allowedRoles,
            userRole,
            reason: 'Limited role permissions'
          },
          req,
          status: 'failure',
          errorMessage: `Insufficient role permissions. Required: ${allowedRoles.join(', ')}, User role: ${userRole}`,
          complianceFlags: ['ISO_27001']
        }).catch(err => console.error('Audit log error:', err));

        return res.status(403).json({
          success: false,
          error: 'Insufficient role permissions',
          requiredRoles: allowedRoles
        });
      }

      // Authorization successful, proceed to next middleware
      next();

    } catch (error) {
      console.error('Error in requireRole middleware:', error);

      // Log middleware error
      await logAuditEvent({
        actorId: req.user ? req.user.id : 'unknown',
        actorRole: req.user ? req.user.role : 'unknown',
        action: 'ROLE_CHECK_ERROR',
        targetType: 'endpoint',
        targetId: null,
        metadata: {
          endpoint: req.originalUrl,
          error: error.message
        },
        req,
        status: 'failure',
        errorMessage: error.message
      }).catch(err => console.error('Audit log error:', err));

      return res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};

/**
 * Higher-order RBAC middleware with role hierarchy
 * Allows checking if user has role level or higher
 * 
 * Usage: requireRoleLevel(ROLE_HIERARCHY.TEACHER) allows teacher and above
 */
const requireRoleLevel = (minimumLevel) => {
  const { ROLE_HIERARCHY } = require('../constants/roles');

  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const userLevel = ROLE_HIERARCHY[userRole];

      if (userLevel === undefined || userLevel < minimumLevel) {
        await logAuditEvent({
          actorId: req.user.id,
          actorRole: userRole,
          action: 'ACCESS_DENIED_INSUFFICIENT_ROLE_LEVEL',
          targetType: 'SYSTEM',
          targetId: null,
          metadata: {
            endpoint: req.originalUrl,
            method: req.method,
            minimumLevel,
            userLevel,
            userRole
          },
          req,
          status: 'failure',
          errorMessage: `Insufficient role level. Minimum: ${minimumLevel}, User level: ${userLevel}`,
          complianceFlags: ['ISO_27001']
        }).catch(err => console.error('Audit log error:', err));

        return res.status(403).json({
          success: false,
          error: 'Insufficient role level'
        });
      }

      next();

    } catch (error) {
      console.error('Error in requireRoleLevel middleware:', error);

      return res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};

module.exports = { requireRole, requireRoleLevel };
