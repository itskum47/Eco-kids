const crypto = require('crypto');
const ActivitySubmission = require('../models/ActivitySubmission');
const FraudFlag = require('../models/FraudFlag');
const { redisClient } = require('../services/cacheService');

const COOLDOWN_PREFIX = 'cooldown';
const MAX_SUBMISSIONS_PER_CATEGORY = 3;
const COOLDOWN_WINDOW_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Validate geo-location on submission.
 * Returns null if valid, or an error object if invalid.
 */
exports.validateGeoLocation = (latitude, longitude, accuracy) => {
    if (latitude === undefined || longitude === undefined) {
        return {
            valid: false,
            flagType: 'invalid_geo',
            message: 'GPS location is required. Please enable location services.',
            confidence: 1.0
        };
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return {
            valid: false,
            flagType: 'invalid_geo',
            message: 'Invalid GPS coordinates.',
            confidence: 1.0
        };
    }

    // Basic India bounding box check (6°N to 37°N, 68°E to 97°E)
    if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
        return {
            valid: false,
            flagType: 'invalid_geo',
            message: 'Location appears to be outside India.',
            confidence: 0.9
        };
    }

    // Accuracy check (if provided)
    if (accuracy !== undefined && parseFloat(accuracy) > 100) {
        return {
            valid: false,
            flagType: 'invalid_geo',
            message: `GPS accuracy too low (${accuracy}m). Please move to an area with better GPS reception.`,
            confidence: 0.7
        };
    }

    return { valid: true };
};

/**
 * Check submission cooldown.
 * Max MAX_SUBMISSIONS_PER_CATEGORY per activity type per 7-day rolling window.
 */
exports.checkSubmissionCooldown = async (userId, activityCategory) => {
    try {
        const key = `${COOLDOWN_PREFIX}:${userId}:${activityCategory}`;
        const count = await redisClient.get(key);
        const currentCount = parseInt(count) || 0;

        if (currentCount >= MAX_SUBMISSIONS_PER_CATEGORY) {
            const ttl = await redisClient.ttl(key);
            const nextAvailable = new Date(Date.now() + ttl * 1000);

            return {
                allowed: false,
                currentCount,
                maxAllowed: MAX_SUBMISSIONS_PER_CATEGORY,
                nextAvailableAt: nextAvailable.toISOString(),
                retryAfterSeconds: ttl
            };
        }

        return { allowed: true, currentCount, maxAllowed: MAX_SUBMISSIONS_PER_CATEGORY };
    } catch (error) {
        console.error('[FraudService] Cooldown check failed:', error.message);
        // Fail open — don't block submissions if Redis is down
        return { allowed: true, currentCount: 0, maxAllowed: MAX_SUBMISSIONS_PER_CATEGORY };
    }
};

/**
 * Record a submission for cooldown tracking.
 */
exports.recordSubmissionForCooldown = async (userId, activityCategory) => {
    try {
        const key = `${COOLDOWN_PREFIX}:${userId}:${activityCategory}`;
        const count = await redisClient.incr(key);

        // Set TTL on first submission in the window
        if (count === 1) {
            await redisClient.expire(key, COOLDOWN_WINDOW_SECONDS);
        }
    } catch (error) {
        console.error('[FraudService] Cooldown record failed:', error.message);
    }
};

/**
 * Generate perceptual hash of an image buffer.
 * Uses a simplified approach: resize to 8x8 grayscale → compute average → generate 64-bit hash.
 * This catches visually similar images even if they've been resized/compressed.
 */
exports.generatePHash = async (buffer) => {
    try {
        const sharp = require('sharp');

        // Resize to 8x8, grayscale, raw pixel data
        const { data } = await sharp(buffer)
            .resize(8, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Compute average pixel value
        const pixels = Array.from(data);
        const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

        // Generate hash: each pixel above average = 1, below = 0
        let hash = '';
        for (const pixel of pixels) {
            hash += pixel >= avg ? '1' : '0';
        }

        // Convert binary string to hex
        const hexHash = BigInt('0b' + hash).toString(16).padStart(16, '0');
        return hexHash;
    } catch (error) {
        console.error('[FraudService] pHash generation failed:', error.message);
        return null;
    }
};

/**
 * Check if a perceptual hash matches any recent submissions.
 * Returns matching submissions if found.
 */
exports.checkPHashDuplicate = async (pHash, userId) => {
    if (!pHash) return { isDuplicate: false };

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Check same user
    const sameUserMatch = await ActivitySubmission.findOne({
        user: userId,
        pHash,
        createdAt: { $gte: ninetyDaysAgo }
    }).lean();

    if (sameUserMatch) {
        return {
            isDuplicate: true,
            flagType: 'duplicate_image',
            confidence: 0.95,
            message: 'You have already submitted a visually identical photo.',
            matchedSubmissions: [sameUserMatch._id]
        };
    }

    // Check cross-student (3+ different students with same hash)
    const crossStudentMatches = await ActivitySubmission.find({
        user: { $ne: userId },
        pHash,
        createdAt: { $gte: ninetyDaysAgo }
    }).select('_id user').lean();

    if (crossStudentMatches.length >= 2) { // 2 existing + current = 3 total
        return {
            isDuplicate: true,
            flagType: 'duplicate_image',
            confidence: 0.9,
            message: 'This image appears to have been shared among multiple students.',
            matchedSubmissions: crossStudentMatches.map(s => s._id),
            crossStudent: true,
            autoSuspend: true
        };
    }

    return { isDuplicate: false };
};

/**
 * Create a fraud flag record.
 */
exports.createFraudFlag = async (submissionId, userId, flagType, confidence, details, matchedSubmissions = []) => {
    try {
        // Prevent duplicate flags for same submission + type
        const existing = await FraudFlag.findOne({ submissionId, flagType });
        if (existing) return existing;

        const flag = await FraudFlag.create({
            submissionId,
            userId,
            flagType,
            confidence,
            details,
            matchedSubmissions,
            resolution: 'pending'
        });

        console.log(`[FraudFlag] Created: ${flagType} for submission ${submissionId} (confidence: ${confidence})`);
        return flag;
    } catch (error) {
        console.error('[FraudFlag] Creation failed:', error.message);
        return null;
    }
};
