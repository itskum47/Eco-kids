const User = require('../models/User');
const EcoPointsTransaction = require('../models/EcoPointsTransaction');
const RewardLedger = require('../models/RewardLedger');
const { gamificationQueue } = require('../queues/gamificationQueue');
const logger = require('./logger');

/**
 * Idempotent reward credit.
 * If the idempotencyKey already exists, returns null (no-op).
 * If new, atomically credits EP and writes to both RewardLedger and EcoPointsTransaction.
 */
async function creditReward({ userId, points, reason, idempotencyKey, sourceId, sourceModel, action = 'EP_CREDIT' }) {
    if (!points || points <= 0) return null;
    if (!idempotencyKey) {
        logger.warn('[RewardEngine] creditReward called without idempotencyKey — generating fallback.');
        idempotencyKey = `${userId}:${sourceId || 'none'}:${action}:${Date.now()}`;
    }

    // Idempotency check — if already processed, skip silently
    const existing = await RewardLedger.findOne({ idempotencyKey });
    if (existing) {
        logger.info(`[RewardEngine] Duplicate reward skipped: ${idempotencyKey}`);
        return null;
    }

    // Write to RewardLedger (source of truth)
    try {
        await RewardLedger.create({
            idempotencyKey,
            userId,
            action,
            amount: points,
            sourceId: sourceId || null,
            sourceModel: sourceModel || 'System',
            reason
        });
    } catch (err) {
        // E11000 duplicate key = another concurrent request won the race
        if (err.code === 11000) {
            logger.info(`[RewardEngine] Race condition caught (duplicate key): ${idempotencyKey}`);
            return null;
        }
        throw err;
    }

    // Atomic EP increment on User
    const updateResult = await User.findByIdAndUpdate(
        userId,
        { $inc: { 'gamification.ecoPoints': points } },
        { new: true, select: 'gamification.ecoPoints' }
    );

    // Legacy EcoPointsTransaction (backward compat — can be removed later)
    await EcoPointsTransaction.create({
        userId,
        points,
        reason,
        sourceType: sourceModel === 'ActivitySubmission' ? 'activity'
            : sourceModel === 'Quiz' ? 'achievement'
                : sourceModel === 'Experiment' ? 'achievement'
                    : sourceModel === 'DailyHabit' ? 'habit'
                        : 'activity',
        sourceId: sourceId || null,
        sourceName: reason
    }).catch(err => logger.warn('[RewardEngine] Legacy EcoPointsTransaction write failed:', err.message));

    // Dispatch gamification evaluation (badges/levels) to background worker
    try {
        await gamificationQueue.add('evaluateGamification', {
            studentId: userId,
            pointsAdded: points,
            type: sourceModel || 'System',
            name: reason || 'Reward Credit',
            scopeData: { sourceId, sourceModel }
        });
    } catch (queueError) {
        logger.error(`[RewardEngine] BullMQ dispatch failed for ${userId}:`, queueError);
    }

    return updateResult?.gamification?.ecoPoints || null;
}

/**
 * Rollback a previously credited reward.
 * Creates a counter-entry in RewardLedger (never deletes original).
 * Atomically decrements EP from user.
 */
async function rollbackReward({ userId, sourceId, sourceModel, reason }) {
    // Find the original credit entry
    const original = await RewardLedger.findOne({
        userId,
        sourceId,
        sourceModel,
        action: 'EP_CREDIT',
        reversedAt: null
    });

    if (!original) {
        logger.warn(`[RewardEngine] No reversible reward found for source: ${sourceId}`);
        return null;
    }

    const reversalKey = `${original.idempotencyKey}:REVERSAL`;

    // Idempotent reversal check
    const existingReversal = await RewardLedger.findOne({ idempotencyKey: reversalKey });
    if (existingReversal) {
        logger.info(`[RewardEngine] Duplicate reversal skipped: ${reversalKey}`);
        return null;
    }

    // Write reversal entry
    try {
        await RewardLedger.create({
            idempotencyKey: reversalKey,
            userId,
            action: 'EP_REVERSAL',
            amount: -original.amount,
            sourceId,
            sourceModel,
            reason: reason || 'Reward rollback',
            reversalReason: reason || 'submission_rejected'
        });
    } catch (err) {
        if (err.code === 11000) {
            logger.info(`[RewardEngine] Reversal race caught: ${reversalKey}`);
            return null;
        }
        throw err;
    }

    // Mark original as reversed
    original.reversedAt = new Date();
    original.reversalReason = reason || 'submission_rejected';
    await original.save();

    // Atomic EP decrement
    await User.findByIdAndUpdate(userId, {
        $inc: { 'gamification.ecoPoints': -original.amount }
    });

    logger.info(`[RewardEngine] Rolled back ${original.amount} EP from user ${userId} (source: ${sourceId})`);
    return original.amount;
}

/**
 * Legacy wrapper — drop-in replacement for old awardEcoPoints().
 * Generates idempotencyKey from metadata when callers haven't been migrated yet.
 */
async function awardEcoPoints(userId, points, reason, metadata = {}) {
    const verificationStatus = metadata?.verification?.status;
    const allowedVerificationStatuses = new Set([
        'teacher_approved',
        'appeal_approved',
        'followup_verified',
        'ai_approved'
    ]);

    if (!allowedVerificationStatuses.has(verificationStatus)) {
        throw new Error('[RewardEngine] awardEcoPoints requires verified action metadata');
    }

    const key = metadata.idempotencyKey
        || `${userId}:${metadata.sourceId || 'none'}:${metadata.sourceType || 'activity'}:${reason}`;

    return creditReward({
        userId,
        points,
        reason,
        idempotencyKey: key,
        sourceId: metadata.sourceId || null,
        sourceModel: metadata.sourceModel || 'System',
        action: 'EP_CREDIT'
    });
}

module.exports = { creditReward, rollbackReward, awardEcoPoints };
