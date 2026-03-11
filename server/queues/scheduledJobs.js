/**
 * Scheduled Jobs — BullMQ Repeatable Jobs
 * Registers all cron workers as repeatable jobs on the existing queue infrastructure.
 *
 * Import and call registerScheduledJobs() from server startup.
 */

const { Queue } = require('bullmq');
const { queueRedis } = require('../services/cacheService');

const scheduledQueue = new Queue('scheduled-jobs', { connection: queueRedis });

async function registerScheduledJobs() {
    console.log('[Scheduler] Registering scheduled jobs...');

    // Clean existing repeatable jobs to prevent duplicates
    const existing = await scheduledQueue.getRepeatableJobs();
    for (const job of existing) {
        await scheduledQueue.removeRepeatableByKey(job.key);
    }

    // ── Daily: Streak Nudge (6 PM IST = 12:30 UTC) ──
    await scheduledQueue.add('streak-nudge', {}, {
        repeat: { pattern: '30 12 * * *' }, // 12:30 UTC = 6:00 PM IST
        removeOnComplete: true,
        removeOnFail: false
    });
    console.log('  ✅ streak-nudge: daily at 6 PM IST');

    // ── Daily: SLA Escalation Check (9 AM IST = 3:30 UTC) ──
    await scheduledQueue.add('sla-escalation', {}, {
        repeat: { pattern: '30 3 * * *' }, // 3:30 UTC = 9:00 AM IST
        removeOnComplete: true,
        removeOnFail: false
    });
    console.log('  ✅ sla-escalation: daily at 9 AM IST');

    // ── Weekly: Impact Report (Sunday 9 AM IST = 3:30 UTC) ──
    await scheduledQueue.add('weekly-impact-report', {}, {
        repeat: { pattern: '30 3 * * 0' }, // Sunday 3:30 UTC = 9:00 AM IST
        removeOnComplete: true,
        removeOnFail: false
    });
    console.log('  ✅ weekly-impact-report: Sundays at 9 AM IST');

    // ── Daily: Challenge Deadline Reminders (10 AM IST = 4:30 UTC) ──
    await scheduledQueue.add('challenge-deadline', {}, {
        repeat: { pattern: '30 4 * * *' }, // 4:30 UTC = 10:00 AM IST
        removeOnComplete: true,
        removeOnFail: false
    });
    console.log('  ✅ challenge-deadline: daily at 10 AM IST');

    // ── Monthly: Points Decay (1st of month, 2 AM IST = 20:30 UTC prev day) ──
    await scheduledQueue.add('points-decay', {}, {
        repeat: { pattern: '30 20 1 * *' }, // 1st at 20:30 UTC = 2:00 AM IST
        removeOnComplete: true,
        removeOnFail: false
    });
    console.log('  ✅ points-decay: 1st of each month at 2 AM IST');

    console.log('[Scheduler] All scheduled jobs registered.');
}

module.exports = { scheduledQueue, registerScheduledJobs };
