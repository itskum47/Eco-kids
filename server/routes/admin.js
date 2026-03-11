const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getContentStats,
  getUserAnalytics,
  getLearningAnalytics,
  bulkUserOperations,
  getAllSubmissions,
  getLeaderboard,
  getOverview,
  getImpactReport,
  getSchoolStats,
  getDistrictStats,
  getStateStats
} = require('../controllers/admin');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All routes require authentication and admin roles (district or state admin)
router.use(protect);
router.use(requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN));

// Dashboard & Overview
router.get('/dashboard', getDashboardStats);
router.get('/overview', getOverview);
router.get('/reports/impact', getImpactReport);
router.get('/submissions', getAllSubmissions);
router.get('/leaderboard', getLeaderboard);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/learning', getLearningAnalytics);
router.get('/content/stats', getContentStats);

// Geographic Admin Dashboards
router.get('/school/:schoolId/stats', getSchoolStats);
router.get('/district/:districtId/stats', getDistrictStats);
router.get('/state/:stateId/stats', getStateStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk', bulkUserOperations);

module.exports = router;