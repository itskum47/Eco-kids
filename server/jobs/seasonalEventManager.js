/**
 * seasonalEventManager.js
 * BullMQ cron that fires daily at midnight IST to manage seasonal event activation/deactivation
 * Handles event metadata updates, Badge awards, and Socket.io broadcasting
 * Registered in server.js on startup
 */
const { Queue, Worker } = require('bullmq');
const { queueRedis } = require('../services/cacheService');
const SeasonalEvent = require('../models/SeasonalEvent');
const Badge = require('../models/Badge');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const ActivityFeed = require('../models/ActivityFeed');
const logger = require('../utils/logger');

const eventQueue = new Queue('SeasonalEventQueue', { connection: queueRedis });

/**
 * Register the repeatable cron job
 * Fires at 00:00 IST every day (18:30 UTC previous day)
 */
const scheduleSeasonalEventJob = async () => {
    await eventQueue.add(
        'manage-seasonal-events',
        {},
        {
            repeat: { pattern: '30 18 * * *' }, // 00:00 IST = 18:30 UTC
            jobId: 'seasonal-event-cron'
        }
    );
    logger.info('[SeasonalEventQueue] Cron job registered: 00:00 IST daily');
};

/**
 * Worker that executes event management
 * 1. Activates events where startsAt <= now <= endsAt
 * 2. Deactivates events where endsAt < now
 * 3. Emits Socket.io events for state changes
 * 4. Awards special badges to participants on event end
 */
const eventWorker = new Worker('SeasonalEventQueue', async (job) => {
    if (job.name !== 'manage-seasonal-events') return;

    logger.info('[SeasonalEventManager] Starting event management cycle...');

    try {
        const now = new Date();

        // ─────────────────────────────────────────────────────────
        // STEP 1: Find events that should be activated
        // ─────────────────────────────────────────────────────────
        const toActivate = await SeasonalEvent.find({
            isActive: false,
            startsAt: { $lte: now },
            endsAt: { $gte: now }
        });

        for (const event of toActivate) {
            await SeasonalEvent.findByIdAndUpdate(event._id, { isActive: true });

            logger.info(`[SeasonalEventManager] Activated event: ${event.title}`);

            // Emit Socket.io event to all connected clients (if io instance available)
            if (global.io) {
                global.io.emit('seasonal-event-started', {
                    eventId: event._id.toString(),
                    name: event.title,
                    description: event.description,
                    multiplier: event.bonusMultiplier,
                    endsAt: event.endsAt.toISOString(),
                    theme: event.theme,
                    emoji: getThemeEmoji(event.theme)
                });
            }

            // Create audit log
            await AuditLog.create({
                actor: null,
                action: 'SEASONAL_EVENT_STARTED',
                subject: 'SeasonalEvent',
                subjectId: event._id,
                metadata: {
                    eventTitle: event.title,
                    multiplier: event.bonusMultiplier,
                    endsAt: event.endsAt
                }
            });
        }

        // ─────────────────────────────────────────────────────────
        // STEP 2: Find events that should be deactivated
        // ─────────────────────────────────────────────────────────
        const toDeactivate = await SeasonalEvent.find({
            isActive: true,
            endsAt: { $lt: now }
        });

        for (const event of toDeactivate) {
            await SeasonalEvent.findByIdAndUpdate(event._id, { isActive: false });

            logger.info(`[SeasonalEventManager] Deactivated event: ${event.title}`);

            // ─────────────────────────────────────────────────────────
            // STEP 3: Award special badge to all participants
            // ─────────────────────────────────────────────────────────
            if (event.specialBadgeId) {
                const badge = await Badge.findById(event.specialBadgeId);

                // Find all users who completed at least 1 activity during the event
                // (via ActivityFeed records with timestamp in event range)
                const participants = await ActivityFeed.distinct('user', {
                    createdAt: {
                        $gte: event.startsAt,
                        $lte: event.endsAt
                    }
                });

                for (const userId of participants) {
                    // Award badge atomically
                    const result = await User.findOneAndUpdate(
                        {
                            _id: userId,
                            'gamification.badges': { $ne: event.specialBadgeId }
                        },
                        {
                            $push: {
                                'gamification.badges': {
                                    badgeId: event.specialBadgeId,
                                    earnedAt: new Date()
                                }
                            }
                        },
                        { new: true }
                    );

                    if (result) {
                        logger.info(`[SeasonalEventManager] Awarded '${badge?.name}' to user ${userId} for event completion`);

                        // Create audit log for badge award
                        await AuditLog.create({
                            actor: userId,
                            action: 'BADGE_EARNED',
                            subject: 'Badge',
                            subjectId: event.specialBadgeId,
                            metadata: {
                                eventId: event._id,
                                eventTitle: event.title,
                                badgeName: badge?.name
                            }
                        });
                    }
                }
            }

            // Emit Socket.io event for event end
            if (global.io) {
                global.io.emit('seasonal-event-ended', {
                    eventId: event._id.toString(),
                    name: event.title,
                    completionMessage: `🎉 ${event.title} has ended! Great effort from all participants!`,
                    participantCount: event.participantCount || 0
                });
            }

            // Create audit log
            await AuditLog.create({
                actor: null,
                action: 'SEASONAL_EVENT_ENDED',
                subject: 'SeasonalEvent',
                subjectId: event._id,
                metadata: {
                    eventTitle: event.title,
                    participantCount: event.participantCount,
                    specialBadgeAwarded: !!event.specialBadgeId
                }
            });
        }

        logger.info(`[SeasonalEventManager] Cycle complete. Activated: ${toActivate.length}, Deactivated: ${toDeactivate.length}`);

    } catch (err) {
        logger.error('[SeasonalEventManager] Error during event management:', err);
        throw err;
    }
}, { connection: queueRedis });

eventWorker.on('failed', (job, err) => {
    logger.error(`[SeasonalEventManager] Job ${job?.id} failed:`, err);
});

/**
 * Helper: Get emoji for theme
 */
function getThemeEmoji(theme) {
    const emojiMap = {
        earth_day: '🌍',
        environment_day: '🌳',
        clean_air: '💨',
        water_week: '💧',
        biodiversity: '🦋',
        diwali_clean: '🪔',
        independence_green: '🇮🇳',
        custom: '🌱'
    };
    return emojiMap[theme] || '🌱';
}

module.exports = { eventQueue, scheduleSeasonalEventJob };
