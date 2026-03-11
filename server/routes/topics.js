const express = require('express');
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicsByCategory,
  getPopularTopics,
  searchTopics,
  likeTopic,
  completeTopic
} = require('../controllers/topics');

const { protect, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { validateTopic, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validatePagination, optionalAuth, getTopics);
router.get('/popular', getPopularTopics);
router.get('/category/:category', validatePagination, getTopicsByCategory);
router.get('/search', searchTopics);
router.get('/:id', validateObjectId, optionalAuth, getTopic);

// Protected routes
router.post('/:id/like', protect, validateObjectId, likeTopic);
router.post('/:id/complete', protect, validateObjectId, completeTopic);

// Teacher/Admin routes (content creation)
router.post('/', protect, requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN), validateTopic, createTopic);
router.put('/:id', protect, requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN), validateObjectId, validateTopic, updateTopic);
router.delete('/:id', protect, requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN), validateObjectId, deleteTopic);

module.exports = router;