const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const {
  getSchoolTeams,
  getTeamById,
  createTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamStats,
  getTeamLeaderboard,
  deleteTeam
} = require('../controllers/teamController');

const router = express.Router();

// Public routes
router.get('/leaderboard', getTeamLeaderboard);

// Protected routes
router.use(protect);

router.get('/school/:schoolId', getSchoolTeams);
router.get('/:id', getTeamById);
router.post('/:id/update-stats', updateTeamStats);

// Teacher/Admin routes
router.post(
  '/',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  createTeam
);
router.patch(
  '/:id',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  updateTeam
);
router.post(
  '/:id/members',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  addTeamMember
);
router.delete(
  '/:id/members/:userId',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  removeTeamMember
);
router.delete(
  '/:id',
  requireRole(ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  deleteTeam
);

module.exports = router;
