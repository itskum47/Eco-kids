const express = require('express');
const {
  getGames,
  getGame,
  getGameBySlug,
  getPopularGames,
  getGameCategories,
  createGame,
  updateGame,
  deleteGame,
  startGame,
  updateGameProgress,
  submitGameScore
} = require('../controllers/games');

const { protect } = require('../middleware/auth');
const { requireConsent } = require('../middleware/requireConsent');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getGames);
router.get('/popular', getPopularGames);
router.get('/categories', getGameCategories);
router.get('/slug/:slug', getGameBySlug);
router.get('/:id', validateObjectId, getGame);

// Protected routes
router.post('/:id/start', protect, requireConsent, validateObjectId, startGame);
router.put('/:id/progress', protect, requireConsent, validateObjectId, updateGameProgress);
// Student routes
router.post('/:id/score', protect, requireConsent, submitGameScore);

// Admin/Teacher routes (require role-based access)
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

router.post('/', protect, requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN), createGame);
router.put('/:id', protect, requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN), updateGame);
router.delete('/:id', protect, requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN), deleteGame);

module.exports = router;