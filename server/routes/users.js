const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProgress,
  getUserAchievements,
  getLeaderboard,
  updateUserRole
} = require('../controllers/users');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes (authenticated users only)
router.get('/progress', getUserProgress);
router.get('/achievements', getUserAchievements);
router.get('/leaderboard', getLeaderboard);

// Admin only routes (district_admin and state_admin)
router.get('/', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), validatePagination, getUsers);
router.get('/:id', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), validateObjectId, getUser);
router.put('/:id', requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), validateObjectId, updateUser);
router.put('/:id/role', requireRole(ROLES.STATE_ADMIN), validateObjectId, updateUserRole);
router.delete('/:id', requireRole(ROLES.STATE_ADMIN), validateObjectId, deleteUser);

module.exports = router;