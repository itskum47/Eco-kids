/**
 * Scheduled Jobs Worker — processes repeatable jobs from the scheduled queue.
 * Should be run alongside the main gamification worker.
 */

const { Worker } = require('bullmq');
const { queueRedis } = require('../services/cacheService');
const { processStreakNudges } = require('../workers/streakNudgeWorker');
const { processSLAEscalations } = require('../workers/slaEscalationWorker');
const { processWeeklyImpactReports } = require('../workers/weeklyImpactReportWorker');
const { processPointsDecay } = require('../workers/pointsDecayWorker');
const { processChallengeDeadlines } = require('../workers/challengeDeadlineWorker');

const connectDB = require('../config/database');

async function startScheduledWorker() {
    await connectDB();

    const worker = new Worker('scheduled-jobs', async (job) => {
        console.log(`[ScheduledWorker] Processing: ${job.name} at ${new Date().toISOString()}`);

        switch (job.name) {
            case 'streak-nudge':
                return await processStreakNudges();

            case 'sla-escalation':
                return await processSLAEscalations();

            case 'weekly-impact-report':
                return await processWeeklyImpactReports();

            case 'points-decay':
                return await processPointsDecay();

            case 'challenge-deadline':
                return await processChallengeDeadlines();

            default:
                console.warn(`[ScheduledWorker] Unknown job: ${job.name}`);
        }
    }, {
        connection: queueRedis,
        concurrency: 1
    });

    worker.on('completed', (job, result) => {
        console.log(`[ScheduledWorker] ✅ ${job.name} completed:`, result);
    });

    worker.on('failed', (job, err) => {
        console.error(`[ScheduledWorker] ❌ ${job.name} failed:`, err.message);
    });

    console.log('[ScheduledWorker] Listening for scheduled jobs...');
    return worker;
}

module.exports = { startScheduledWorker };

// Run standalone
if (require.main === module) {
    require('dotenv').config();
    startScheduledWorker().catch(console.error);
}
