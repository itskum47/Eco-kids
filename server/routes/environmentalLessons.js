const express = require('express');
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  publishLesson,
  deleteLesson,
  completeLesson,
  getLessonStatus,
  getLessonsByCategory
} = require('../controllers/environmentalLessonController');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Public routes
router.get('/', getLessons);
router.get('/category/:category', getLessonsByCategory);
router.get('/:id', getLesson);

// Teacher & Admin routes
router.post(
  '/',
  protect,
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  createLesson
);

router.put(
  '/:id',
  protect,
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  updateLesson
);

router.delete(
  '/:id',
  protect,
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  deleteLesson
);

router.patch(
  '/:id/publish',
  protect,
  requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  publishLesson
);

// Student routes
router.post(
  '/:id/complete',
  protect,
  requireRole(ROLES.STUDENT),
  completeLesson
);

router.get(
  '/:id/status',
  protect,
  getLessonStatus
);

module.exports = router;
