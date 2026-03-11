const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { redisClient } = require('../services/cacheService');

exports.submissionLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:submissions:'
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Max 5 submissions per hour per user
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Activity limit reached to prevent spam. Please try again later."
    }
});

exports.loginLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:login:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 5, // Dev: 100, Prod: 5 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});
