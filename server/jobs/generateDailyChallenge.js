/**
 * generateDailyChallenge.js
 * BullMQ cron that fires at 23:59 IST (18:29 UTC) to seed the next day's challenge.
 * Registered in server.js / worker startup.
 */
const { Queue, Worker } = require('bullmq');
const { queueRedis } = require('../services/cacheService');
const DailyChallenge = require('../models/DailyChallenge');
const logger = require('../utils/logger');

const challengeQueue = new Queue('DailyChallengeQueue', { connection: queueRedis });

// Repeatable job: every day at 23:59 IST  (IST = UTC+5:30, so 18:29 UTC)
const scheduleDailyChallengeJob = async () => {
    await challengeQueue.add(
        'generate-daily-challenge',
        {},
        {
            repeat: { pattern: '29 18 * * *' }, // 23:59 IST = 18:29 UTC
            jobId: 'daily-challenge-cron'
        }
    );
    logger.info('[DailyChallengeQueue] Cron job registered: 23:59 IST daily');
};

// Challenge templates pool (rotated daily)
const CHALLENGE_TEMPLATES = [
    { title: '🌱 Plant a Sapling', description: 'Plant at least one sapling in your school garden or community area. Photograph it with a scale reference.', activityType: 'tree-planting', ecoPointsReward: 60 },
    { title: '♻️ Sort Your Waste', description: 'Separate wet and dry waste at home for one full day. Photograph the segregated bins.', activityType: 'waste-recycling', ecoPointsReward: 50 },
    { title: '💧 Save 10 Litres', description: 'Track and save at least 10 litres of water today through shorter showers and tap discipline.', activityType: 'water-saving', ecoPointsReward: 50 },
    { title: '⚡ Unplug It', description: 'Identify and unplug 5 phantom power devices (chargers, standby TVs) in your home or school.', activityType: 'energy-saving', ecoPointsReward: 45 },
    { title: '🧹 Plastic-Free Day', description: 'Go completely plastic-free for one day. Document alternatives you used instead of single-use plastic.', activityType: 'plastic-reduction', ecoPointsReward: 65 },
    { title: '🍂 Start a Compost Bin', description: 'Set up or add to a compost pile with kitchen scraps. Photograph the process.', activityType: 'composting', ecoPointsReward: 55 },
    { title: '🦋 Biodiversity Walk', description: 'Identify and photograph 5 different plant or animal species in your local area.', activityType: 'biodiversity-survey', ecoPointsReward: 70 },
];

// Worker that executes the job
const dailyChallengeWorker = new Worker('DailyChallengeQueue', async (job) => {
    if (job.name !== 'generate-daily-challenge') return;

    // Tomorrow's date in IST
    const tomorrowIST = (() => {
        const now = new Date();
        const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        ist.setDate(ist.getDate() + 1);
        return ist.toISOString().slice(0, 10);
    })();

    // Skip if already exists (idempotent)
    const existing = await DailyChallenge.findOne({ challengeDate: tomorrowIST });
    if (existing) {
        logger.info(`[DailyChallengeWorker] Challenge for ${tomorrowIST} already exists, skipping`);
        return;
    }

    // Pick a template based on day-of-year for deterministic rotation
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    const template = CHALLENGE_TEMPLATES[dayOfYear % CHALLENGE_TEMPLATES.length];

    // Midnight IST of the target date
    const expiresAt = new Date(`${tomorrowIST}T18:30:00.000Z`); // 18:30 UTC = midnight IST

    await DailyChallenge.create({
        ...template,
        challengeDate: tomorrowIST,
        expiresAt
    });

    logger.info(`[DailyChallengeWorker] Created challenge for ${tomorrowIST}: ${template.title}`);
}, { connection: queueRedis });

dailyChallengeWorker.on('failed', (job, err) => {
    logger.error(`[DailyChallengeWorker] Job ${job?.id} failed:`, err);
});

module.exports = { challengeQueue, scheduleDailyChallengeJob };
