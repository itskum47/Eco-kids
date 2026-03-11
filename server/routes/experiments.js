const express = require('express');
const {
  getExperiments,
  getExperiment,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  submitExperimentResult,
  getExperimentSubmissions,
  reviewSubmission,
  getMySubmissions,
  getFeaturedExperiments,
  getPopularExperiments
} = require('../controllers/experimentController');

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { ROLES } = require('../constants/roles');
const { requireConsent } = require('../middleware/requireConsent');
const { upload } = require('../middleware/upload');
const { body } = require('express-validator');

const router = express.Router();

// Validation rules
const experimentValidation = [
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
  body('objective')
    .notEmpty()
    .withMessage('Objective is required'),
  body('category')
    .isIn([
      'air-quality',
      'water-testing',
      'soil-analysis',
      'plant-biology',
      'renewable-energy',
      'waste-recycling',
      'weather-climate',
      'biodiversity'
    ])
    .withMessage('Please select a valid category'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Please select a valid difficulty level'),
  body('estimatedTime')
    .isInt({ min: 1 })
    .withMessage('Estimated time must be a positive number')
];

const submissionValidation = [
  body('observations')
    .notEmpty()
    .withMessage('Observations are required'),
  body('results')
    .notEmpty()
    .withMessage('Results are required'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

// Public routes
router.get('/featured', getFeaturedExperiments);
router.get('/popular', getPopularExperiments);
router.get('/', getExperiments);
router.get('/:slug', getExperiment);

// Protected routes
router.use(protect);

// Student routes
router.get('/user/my-submissions', requireConsent, getMySubmissions);
router.post('/:id/submit', 
  requireConsent,
  upload.fields([
    { name: 'photos', maxCount: 10 }
  ]),
  submissionValidation,
  submitExperimentResult
);

// Teacher/Admin routes
router.get('/:id/submissions', 
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  getExperimentSubmissions
);

router.put('/:id/submissions/:submissionId',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  [
    body('status')
      .isIn(['submitted', 'reviewed', 'approved', 'needs-revision'])
      .withMessage('Please select a valid status'),
    body('points')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Points must be a non-negative number')
  ],
  reviewSubmission
);

// Content creation routes (Teachers/Admins)
router.post('/',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'instructionImages', maxCount: 10 },
    { name: 'resultPhotos', maxCount: 5 }
  ]),
  experimentValidation,
  createExperiment
);

router.put('/:id',
  requireRole(ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.DISTRICT_ADMIN),
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'instructionImages', maxCount: 10 },
    { name: 'resultPhotos', maxCount: 5 }
  ]),
  updateExperiment
);

router.delete('/:id',
  requireRole(ROLES.DISTRICT_ADMIN, ROLES.STATE_ADMIN),
  deleteExperiment
);

module.exports = router;