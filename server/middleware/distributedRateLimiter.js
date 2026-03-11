const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
});

const createLimiter = (opts) => new RateLimiterRedis({ storeClient: redisClient, ...opts });

const limiters = {
    global: createLimiter({ keyPrefix: 'rl:global', points: 100, duration: 60 }),
    auth: createLimiter({ keyPrefix: 'rl:auth', points: 5, duration: 900, blockDuration: 900 }),
    register: createLimiter({ keyPrefix: 'rl:reg', points: 3, duration: 3600 }),
    submission: createLimiter({ keyPrefix: 'rl:sub', points: 10, duration: 3600 }),
    export: createLimiter({ keyPrefix: 'rl:exp', points: 5, duration: 3600 }),
};

const makeMiddleware = (limiter, keyFn) => async (req, res, next) => {
    try {
        const key = keyFn ? keyFn(req) : req.ip;
        const result = await limiter.consume(key);
        res.set({
            'X-RateLimit-Limit': limiter.points,
            'X-RateLimit-Remaining': result.remainingPoints,
            'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString(),
        });
        next();
    } catch (rlRes) {
        if (rlRes instanceof Error) {
            logger.error({ err: rlRes }, 'Rate limiter Redis error — allowing request');
            return next();
        }
        const retryAfter = Math.ceil(rlRes.msBeforeNext / 1000);
        res.set({
            'Retry-After': retryAfter,
            'X-RateLimit-Limit': limiter.points,
            'X-RateLimit-Remaining': 0,
        });
        res.status(429).json({
            error: 'Too many requests',
            retryAfter,
        });
    }
};

const distributedRateLimit = (maxRequests = 10, windowMs = 60000) => {
    const rawLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: `rl:dynamic:${maxRequests}:${windowMs}`,
        points: maxRequests,
        duration: Math.ceil(windowMs / 1000)
    });
    return async (req, res, next) => {
        if (!req.user) return next();
        const key = req.user._id.toString();
        try {
            await rawLimiter.consume(key);
            next();
        } catch (rlRes) {
            res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }
    };
};

module.exports = {
    globalLimiter: makeMiddleware(limiters.global),
    authLimiter: makeMiddleware(limiters.auth),
    registerLimiter: makeMiddleware(limiters.register),
    submissionLimiter: makeMiddleware(limiters.submission, (req) => req.user?._id?.toString() || req.ip),
    exportLimiter: makeMiddleware(limiters.export),
    distributedRateLimit,
};
