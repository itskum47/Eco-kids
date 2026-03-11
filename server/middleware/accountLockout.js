const { redisClient } = require('../services/cacheService');
const { logAuthEvent } = require('../utils/auditLogger');

const LOCKOUT_PREFIX = 'lockout:';
const ATTEMPTS_PREFIX = 'login_attempts:';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 3600; // 1 hour in seconds
const ATTEMPT_WINDOW = 900;   // 15 minutes in seconds

/**
 * Account lockout middleware.
 * Checks Redis for failed login attempts before allowing authentication.
 * After MAX_ATTEMPTS failures within ATTEMPT_WINDOW, locks the account for LOCKOUT_DURATION.
 */
exports.checkAccountLockout = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next();

        const normalizedEmail = email.toLowerCase().trim();
        const lockoutKey = `${LOCKOUT_PREFIX}${normalizedEmail}`;

        // Check if account is currently locked
        const lockoutTTL = await redisClient.ttl(lockoutKey);
        if (lockoutTTL > 0) {
            const unlockAt = new Date(Date.now() + lockoutTTL * 1000);

            await logAuthEvent(
                null,
                'unknown',
                'LOGIN_BLOCKED_LOCKOUT',
                req,
                { email: normalizedEmail, unlockAt: unlockAt.toISOString() }
            ).catch(() => { });

            return res.status(423).json({
                success: false,
                message: 'Account temporarily locked due to too many failed login attempts',
                unlockAt: unlockAt.toISOString(),
                retryAfterSeconds: lockoutTTL
            });
        }

        next();
    } catch (error) {
        // Fail open — don't block login if Redis is down
        console.error('[AccountLockout] Redis check failed:', error.message);
        next();
    }
};

/**
 * Record a failed login attempt.
 * Called from auth controller when login fails.
 */
exports.recordFailedAttempt = async (email, req) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const attemptsKey = `${ATTEMPTS_PREFIX}${normalizedEmail}`;

        // Increment attempts counter
        const attempts = await redisClient.incr(attemptsKey);

        // Set TTL on first attempt
        if (attempts === 1) {
            await redisClient.expire(attemptsKey, ATTEMPT_WINDOW);
        }

        // Lock account if threshold exceeded
        if (attempts >= MAX_ATTEMPTS) {
            const lockoutKey = `${LOCKOUT_PREFIX}${normalizedEmail}`;
            await redisClient.setex(lockoutKey, LOCKOUT_DURATION, JSON.stringify({
                lockedAt: new Date().toISOString(),
                attempts,
                lastAttemptIp: req.ip || req.connection?.remoteAddress
            }));

            // Clear attempts counter
            await redisClient.del(attemptsKey);

            await logAuthEvent(
                null,
                'unknown',
                'ACCOUNT_LOCKED',
                req,
                { email: normalizedEmail, attempts, lockoutDuration: LOCKOUT_DURATION }
            ).catch(() => { });

            return { locked: true, attempts };
        }

        return { locked: false, attempts, remaining: MAX_ATTEMPTS - attempts };
    } catch (error) {
        console.error('[AccountLockout] Record attempt failed:', error.message);
        return { locked: false, attempts: 0, remaining: MAX_ATTEMPTS };
    }
};

/**
 * Clear failed attempts on successful login.
 */
exports.clearFailedAttempts = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        await redisClient.del(`${ATTEMPTS_PREFIX}${normalizedEmail}`);
        await redisClient.del(`${LOCKOUT_PREFIX}${normalizedEmail}`);
    } catch (error) {
        console.error('[AccountLockout] Clear attempts failed:', error.message);
    }
};
