const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const leaderboardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Too many leaderboard requests' }
});
const { body } = require('express-validator');
const gamificationController = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');

// Validation schemas
const awardPointsValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('points').isInt({ min: 1, max: 10000 }).withMessage('Points must be between 1 and 10000'),
  body('description').optional().isLength({ min: 1, max: 200 }).withMessage('Description must be 1-200 characters')
];

const generateCertificateValidation = [
  body('templateId').isMongoId().withMessage('Valid template ID is required'),
  body('data').optional().isObject().withMessage('Data must be an object')
];

const createBadgeValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be 1-100 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be 1-500 characters'),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
  body('category').isIn(['achievement', 'milestone', 'special', 'seasonal']).withMessage('Invalid category'),
  body('criteria.type').isIn(['points', 'quizzes', 'games', 'experiments', 'streak', 'special']).withMessage('Invalid criteria type'),
  body('criteria.value').isInt({ min: 1 }).withMessage('Criteria value must be a positive integer'),
  body('criteria.timeframe').optional().isIn(['daily', 'weekly', 'monthly', 'all-time']).withMessage('Invalid timeframe'),
  body('rarity').optional().isIn(['common', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity'),
  body('points').optional().isInt({ min: 0, max: 1000 }).withMessage('Points must be between 0 and 1000')
];

// Public routes
router.get('/badges', gamificationController.getBadges);
router.get('/levels', gamificationController.getLevels);
router.get('/leaderboards', leaderboardLimiter, gamificationController.getGlobalLeaderboard);
router.get('/stats', gamificationController.getAchievementStats);

// Protected routes (require authentication)
router.use(protect);

// User gamification data
router.get('/me', gamificationController.getMyGamificationProfile);
router.get('/me/certificates', gamificationController.getUserCertificates);
router.post('/check-achievements', gamificationController.checkAchievements);

// Certificate generation
router.post('/certificates/generate', generateCertificateValidation, gamificationController.generateCertificate);

// Admin routes (district_admin and state_admin)
router.use(requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN));

// Badge management
router.post('/badges', createBadgeValidation, gamificationController.createBadge);
router.put('/badges/:id', createBadgeValidation, gamificationController.updateBadge);
router.delete('/badges/:id', gamificationController.deleteBadge);

// Manual points award
router.post('/award-points', awardPointsValidation, gamificationController.awardPoints);

module.exports = router;