// Pagination helper
exports.pagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  return {
    skip,
    limit: limitNum,
    page: pageNum
  };
};

// Response formatting
exports.successResponse = (res, statusCode = 200, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

exports.errorResponse = (res, statusCode = 500, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Advanced pagination with metadata
exports.advancedPagination = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    populate = '',
    select = ''
  } = options;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get total count
  const total = await model.countDocuments(query);

  // Build query
  let queryBuilder = model.find(query).skip(skip).limit(limitNum);

  if (sort) {
    queryBuilder = queryBuilder.sort(sort);
  }

  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  const results = await queryBuilder;

  // Pagination metadata
  const pagination = {
    currentPage: pageNum,
    totalPages: Math.ceil(total / limitNum),
    totalResults: total,
    resultsPerPage: limitNum,
    hasNextPage: pageNum < Math.ceil(total / limitNum),
    hasPrevPage: pageNum > 1,
    nextPage: pageNum < Math.ceil(total / limitNum) ? pageNum + 1 : null,
    prevPage: pageNum > 1 ? pageNum - 1 : null
  };

  return {
    results,
    pagination
  };
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format date for Indian timezone
exports.formatDateIST = (date = new Date()) => {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Calculate age from date of birth
exports.calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Slugify text
exports.slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Validate Indian phone number
exports.validateIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Generate OTP
exports.generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Clean HTML content
exports.cleanHTML = (html) => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

// Rate limiting helper
exports.createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Search query builder
exports.buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  const orConditions = fields.map(field => ({
    [field]: searchRegex
  }));
  
  return { $or: orConditions };
};

// Gamification helpers
exports.calculateLevel = (points) => {
  return Math.floor(points / 100) + 1;
};

exports.getPointsForNextLevel = (currentPoints) => {
  const currentLevel = exports.calculateLevel(currentPoints);
  return currentLevel * 100;
};

exports.getLevelProgress = (points) => {
  const level = exports.calculateLevel(points);
  const pointsForCurrentLevel = (level - 1) * 100;
  const pointsForNextLevel = level * 100;
  const progress = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
  
  return {
    currentLevel: level,
    pointsForCurrentLevel,
    pointsForNextLevel,
    progressPercentage: Math.round(progress)
  };
};