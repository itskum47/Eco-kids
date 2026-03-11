/**
 * RBAC Route Protection Examples
 * 
 * This file demonstrates how to properly use the requireRole middleware
 * across different route types in the application.
 */

const { protect } = require('../middleware/auth');
const { requireRole, requireRoleLevel } = require('../middleware/requireRole');
const { requireConsent } = require('../middleware/requireConsent');
const { ROLES, ROLE_HIERARCHY } = require('../constants/roles');

// ============================================================================
// STUDENT ROUTES - Protected with consent requirement
// ============================================================================
/*
router.use(
  '/api/tasks',
  protect,
  requireConsent,
  requireRole(ROLES.STUDENT)
);

router.post('/api/tasks/submit', submitTask);
router.get('/api/tasks', getTasks);
router.get('/api/tasks/:id', getTask);
router.put('/api/tasks/:id', updateTask);
*/

// ============================================================================
// TEACHER ROUTES - Protected for teacher and above
// ============================================================================
/*
router.use(
  '/api/teacher',
  protect,
  requireRole(
    ROLES.TEACHER,
    ROLES.SCHOOL_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.STATE_ADMIN
  )
);

router.get('/api/teacher/dashboard', getTeacherDashboard);
router.get('/api/teacher/students', getStudents);
router.post('/api/teacher/assignments', createAssignment);
router.post('/api/teacher/grade', gradeSubmission);
*/

// ============================================================================
// SCHOOL ADMIN ROUTES - Protected for school admin and above
// ============================================================================
/*
router.use(
  '/api/school-admin',
  protect,
  requireRole(
    ROLES.SCHOOL_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.STATE_ADMIN
  )
);

router.get('/api/school-admin/dashboard', getSchoolAdminDashboard);
router.get('/api/school-admin/users', getSchoolUsers);
router.post('/api/school-admin/users', createSchoolUser);
router.put('/api/school-admin/users/:id', updateSchoolUser);
router.delete('/api/school-admin/users/:id', deleteSchoolUser);
*/

// ============================================================================
// DISTRICT ADMIN ROUTES - Protected for district admin and state admin
// ============================================================================
/*
router.use(
  '/api/district-admin',
  protect,
  requireRole(
    ROLES.DISTRICT_ADMIN,
    ROLES.STATE_ADMIN
  )
);

router.get('/api/district-admin/dashboard', getDistrictAdminDashboard);
router.get('/api/district-admin/schools', getSchools);
router.post('/api/district-admin/schools', createSchool);
router.get('/api/district-admin/analytics', getDistrictAnalytics);
*/

// ============================================================================
// STATE ADMIN ROUTES - Protected for state admin only
// ============================================================================
/*
router.use(
  '/api/state-admin',
  protect,
  requireRole(ROLES.STATE_ADMIN)
);

router.get('/api/state-admin/dashboard', getStateAdminDashboard);
router.get('/api/state-admin/districts', getDistricts);
router.post('/api/state-admin/districts', createDistrict);
router.get('/api/state-admin/system-analytics', getSystemAnalytics);
*/

// ============================================================================
// ALTERNATIVE: Using requireRoleLevel for hierarchy-based access
// ============================================================================
/*
// Allow any level at or above teacher
router.use(
  '/api/teaching',
  protect,
  requireRoleLevel(ROLE_HIERARCHY.TEACHER)
);

// Allow any level at or above district admin
router.use(
  '/api/administration',
  protect,
  requireRoleLevel(ROLE_HIERARCHY.DISTRICT_ADMIN)
);
*/

// ============================================================================
// ENDPOINT-LEVEL RBAC (protect individual routes)
// ============================================================================
/*
// Multiple roles for a single endpoint
router.post(
  '/api/reports/generate',
  protect,
  requireRole(ROLES.TEACHER, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  generateReport
);

// Single role for a single endpoint
router.get(
  '/api/system/configuration',
  protect,
  requireRole(ROLES.STATE_ADMIN),
  getSystemConfiguration
);
*/

module.exports = {
  ROLES,
  ROLE_HIERARCHY
};
