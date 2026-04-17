const jwt = require('jsonwebtoken');
const User = require('../models/UserAdapter'); // Use UserAdapter for MongoDB → Appwrite fallback

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Set token from cookie (if using cookies)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (UserAdapter tries MongoDB first, falls back to Appwrite)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token'
      });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth (for routes that work with or without authentication)
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password'); // Uses UserAdapter fallback
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      req.user = null;
    }
  }

  next();
};

// Check if user owns the resource or is admin
exports.ownerOrAdmin = (resourceModel, userField = 'user') => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Allow if user is admin or owns the resource
      if (req.user.role === 'admin' ||
        resource[userField].toString() === req.user._id.toString()) {
        req.resource = resource;
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

const { distributedRateLimit } = require('./distributedRateLimiter');

// Check rate limiting for user actions (Redis-backed for horizontal scaling)
exports.rateLimitUser = distributedRateLimit;