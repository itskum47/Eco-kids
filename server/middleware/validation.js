const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// User validation rules
exports.validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be student, teacher, or admin'),
  
  this.handleValidationErrors
];

exports.validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  this.handleValidationErrors
];

exports.validateUserProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('profile.grade')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    .withMessage('Grade must be between 1 and 12'),
  
  body('profile.language')
    .optional()
    .isIn(['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi'])
    .withMessage('Invalid language selection'),
  
  this.handleValidationErrors
];

// Topic validation rules
exports.validateTopic = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  
  body('category')
    .isIn([
      'air-pollution', 'water-conservation', 'biodiversity', 'climate-change',
      'waste-management', 'renewable-energy', 'soil-health', 'forest-conservation',
      'ocean-health', 'sustainable-living'
    ])
    .withMessage('Invalid category'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  
  body('gradeLevel')
    .optional()
    .isArray()
    .withMessage('Grade level must be an array'),
  
  body('gradeLevel.*')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    .withMessage('Invalid grade level'),
  
  this.handleValidationErrors
];

// Game validation rules
exports.validateGame = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('instructions')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Instructions must be at least 20 characters long'),
  
  body('category')
    .isIn(['maze', 'puzzle', 'memory', 'matching', 'sorting', 'quiz', 'adventure', 'simulation'])
    .withMessage('Invalid game category'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Estimated time must be between 1 and 60 minutes'),
  
  this.handleValidationErrors
];

// Experiment validation rules
exports.validateExperiment = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('objective')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Objective must be at least 10 characters long'),
  
  body('category')
    .isIn([
      'air-quality', 'water-testing', 'soil-analysis', 'plant-biology',
      'renewable-energy', 'waste-recycling', 'weather-climate', 'biodiversity'
    ])
    .withMessage('Invalid experiment category'),
  
  body('estimatedTime')
    .isInt({ min: 5, max: 300 })
    .withMessage('Estimated time must be between 5 and 300 minutes'),
  
  body('materials')
    .isArray({ min: 1 })
    .withMessage('At least one material is required'),
  
  body('materials.*.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Material name must be at least 2 characters'),
  
  body('procedure')
    .isArray({ min: 2 })
    .withMessage('At least 2 procedure steps are required'),
  
  body('procedure.*.instruction')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Each procedure step must be at least 10 characters'),
  
  this.handleValidationErrors
];

// Quiz validation rules
exports.validateQuiz = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('topic')
    .isMongoId()
    .withMessage('Valid topic ID is required'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Time limit must be between 1 and 60 minutes'),
  
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  
  body('questions.*.questionText')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Question text must be at least 10 characters'),
  
  body('questions.*.questionType')
    .isIn(['multiple-choice', 'true-false', 'fill-blank', 'match-pairs'])
    .withMessage('Invalid question type'),
  
  this.handleValidationErrors
];

// General parameter validation
exports.validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  this.handleValidationErrors
];

// Query parameter validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'rating', 'difficulty'])
    .withMessage('Invalid sort option'),
  
  this.handleValidationErrors
];

// File upload validation
exports.validateFileUpload = (allowedTypes = ['image'], maxSize = 5000000) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file type
      const fileType = file.mimetype.split('/')[0];
      if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${maxSize / 1000000}MB`
        });
      }
    }

    next();
  };
};