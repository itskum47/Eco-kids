const express = require('express');
const {
  getQuizzes,
  getQuiz,
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  getMyQuizAttempts,
  getMyStats,
  getFeaturedQuizzes,
  getPopularQuizzes,
  getQuizzesByTopic,
  createQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { requireConsent } = require('../middleware/requireConsent');
const { body } = require('express-validator');

const router = express.Router();

// Validation rules
const quizValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isMongoId()
    .withMessage('Invalid topic ID'),
  body('category')
    .isIn([
      'air-pollution',
      'water-conservation',
      'biodiversity',
      'climate-change',
      'waste-management',
      'renewable-energy',
      'soil-health',
      'forest-conservation'
    ])
    .withMessage('Please select a valid category'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Please select a valid difficulty level')
];

const answerSubmissionValidation = [
  body('attemptId')
    .notEmpty()
    .withMessage('Attempt ID is required')
    .isMongoId()
    .withMessage('Invalid attempt ID'),
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isMongoId()
    .withMessage('Invalid question ID'),
  body('answer')
    .notEmpty()
    .withMessage('Answer is required')
];

// Public routes
router.get('/featured', getFeaturedQuizzes);
router.get('/popular', getPopularQuizzes);
router.get('/topic/:topicId', getQuizzesByTopic);
router.get('/', getQuizzes);
// Protected routes
router.use(protect);

// Student read routes (no consent required — just viewing)
router.get('/user/my-attempts', getMyQuizAttempts);
router.get('/my-stats', getMyStats);
router.get('/:slug', getQuiz);

// Enforce parental consent for quiz participation (DPDP Act 2023)
router.post('/:id/start', requireConsent, startQuizAttempt);
router.post('/:id/submit-answer', requireConsent, answerSubmissionValidation, submitAnswer);
router.post('/:id/complete',
  requireConsent,
  [
    body('attemptId').isMongoId().withMessage('Invalid attempt ID'),
    body('totalTimeSpent').isInt({ min: 0 }).withMessage('Invalid time spent')
  ],
  completeQuizAttempt
);

// Content creation routes (Teachers/Admins)
router.post('/',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  quizValidation,
  createQuiz
);

router.put('/:id',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  updateQuiz
);

router.delete('/:id',
  requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  deleteQuiz
);

module.exports = router;