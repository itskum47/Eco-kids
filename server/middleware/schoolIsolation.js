const logger = require('../utils/logger');
const { logAuditEvent } = require('../utils/auditLogger');

/**
 * School Isolation Middleware
 * Enforces school-level data boundaries
 * Critical for Phase 6: School A must NEVER see School B's data
 * 
 * Multi-tenant isolation is essential for school compliance:
 * - Data Protection Act 2023 (DPDP)
 * - FERPA equivalent protections
 * - NEP 2020 school autonomy
 */
const schoolIsolation = async (req, res, next) => {
  try {
    // STATE_ADMIN and DISTRICT_ADMIN can access all schools
    if (req.user && ['state_admin', 'district_admin', 'admin'].includes(req.user.role)) {
      // No filtering required for state/district level admins
      req.schoolFilter = null; // Null means no restriction
      return next();
    }

    // For SCHOOL_ADMIN, TEACHER, STUDENT:
    // Enforce school-level isolation. Support both profile.schoolId (new) and profile.school (legacy demo data).
    if (!req.user || !req.user.profile || (!req.user.profile.schoolId && !req.user.profile.school)) {
      return res.status(400).json({
        success: false,
        error: 'School not associated with user'
      });
    }

    const userSchoolId = req.user.profile.schoolId ? req.user.profile.schoolId.toString() : null;
    const userSchoolName = req.user.profile.school ? String(req.user.profile.school) : null;

    // Attach school filter for use in controllers
    req.schoolFilter = userSchoolId
      ? { 'profile.schoolId': req.user.profile.schoolId }
      : { 'profile.school': userSchoolName };

    // Validate: If URL param has schoolId, verify it matches user's school
    if (req.params.schoolId && userSchoolId) {
      const paramSchoolId = req.params.schoolId.toString();
      
      if (paramSchoolId !== userSchoolId) {
        // Log unauthorized cross-school access attempt
        logger.warn({
          userId: req.user._id,
          userRole: req.user.role,
          userSchool: userSchoolId,
          attemptedSchool: paramSchoolId,
          endpoint: req.originalUrl,
          method: req.method,
          ip: req.ip
        }, 'Unauthorized cross-school data access attempt');

        await logAuditEvent({
          actorId: req.user._id,
          actorRole: req.user.role,
          action: 'CROSS_SCHOOL_ACCESS_DENIED',
          targetType: 'SCHOOL',
          targetId: paramSchoolId,
          metadata: {
            userSchool: userSchoolId,
            attemptedSchool: paramSchoolId,
            endpoint: req.originalUrl,
            ip: req.ip,
            reason: 'Cross-school data access violation'
          },
          req,
          status: 'failure',
          complianceFlags: ['DATA_ISOLATION', 'DPDP_2023']
        }).catch(err => logger.error('Audit log error:', err));

        return res.status(403).json({
          success: false,
          error: 'Cross-school data access not permitted. Schools can only access their own data.'
        });
      }
    }

    // Validate: If URL param has studentId/teacherId, verify they belong to user's school
    if (req.params.studentId || req.params.teacherId) {
      const User = require('../models/User');
      const targetUserId = req.params.studentId || req.params.teacherId;

      try {
        const targetUser = await User.findById(targetUserId);

        const targetSchoolId = targetUser?.profile?.schoolId?.toString();
        const targetSchoolName = targetUser?.profile?.school ? String(targetUser.profile.school) : null;
        const isAllowed = userSchoolId
          ? targetSchoolId === userSchoolId
          : targetSchoolName === userSchoolName;

        if (!targetUser || !isAllowed) {
          logger.warn({
            userId: req.user._id,
            userSchool: userSchoolId || userSchoolName,
            targetUser: targetUserId,
            targetSchool: targetSchoolId || targetSchoolName,
            endpoint: req.originalUrl
          }, 'Unauthorized user access attempt');

          await logAuditEvent({
            actorId: req.user._id,
            actorRole: req.user.role,
            action: 'CROSS_SCHOOL_USER_ACCESS_DENIED',
            targetType: 'USER',
            targetId: targetUserId,
            metadata: {
              userSchool: userSchoolId || userSchoolName,
              targetSchool: targetSchoolId || targetSchoolName,
              reason: 'User belongs to different school'
            },
            req,
            status: 'failure',
            complianceFlags: ['DATA_ISOLATION']
          }).catch(err => logger.error('Audit log error:', err));

          return res.status(403).json({
            success: false,
            error: 'User does not belong to your school'
          });
        }
      } catch (error) {
        logger.error({
          targetUserId,
          error: error.message
        }, 'Error checking user school isolation');

        return res.status(500).json({
          success: false,
          error: 'Error validating access'
        });
      }
    }

    next();
  } catch (error) {
    logger.error({
      error: error.message,
      userId: req.user?._id
    }, 'School isolation middleware error');

    res.status(500).json({
      success: false,
      error: 'Server error during authorization check'
    });
  }
};

module.exports = schoolIsolation;
