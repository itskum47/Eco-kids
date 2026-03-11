/**
 * Streak Preservation Nudge Worker
 * Runs daily at 6 PM IST: sends notifications to users about to lose their streak.
 *
 * Run: node workers/streakNudgeWorker.js
 */

const User = require('../models/User');
const Notification = require('../models/Notification');

async function processStreakNudges() {
    const now = new Date();
    console.log(`[StreakNudge] Running at ${now.toISOString()}`);

    // Find users with active streaks who haven't logged in today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const atRiskUsers = await User.find({
        isActive: true,
        role: 'student',
        'gamification.streakDays': { $gte: 3 }, // Only nudge if streak >= 3 days
        lastLogin: { $lt: todayStart }           // Haven't logged in today
    }).select('_id name gamification.streakDays').lean();

    console.log(`[StreakNudge] Found ${atRiskUsers.length} users at risk of losing streaks`);

    let notified = 0;

    for (const user of atRiskUsers) {
        const streakDays = user.gamification?.streakDays || 0;

        const messages = [
            `🔥 Your ${streakDays}-day streak is at risk! Log in and complete an activity to keep it alive!`,
            `🌱 Don't break your ${streakDays}-day eco-streak! Even a small action counts.`,
            `⚡ ${streakDays} days strong! Log in today to keep your streak going!`
        ];

        const message = messages[streakDays % messages.length];

        try {
            // Check if we already sent a nudge today
            const existingNudge = await Notification.findOne({
                userId: user._id,
                type: 'streak',
                createdAt: { $gte: todayStart }
            });

            if (existingNudge) continue; // Already nudged today

            await Notification.create({
                userId: user._id,
                type: 'streak',
                title: 'Streak Alert! 🔥',
                message,
                data: {
                    currentStreak: streakDays,
                    nudgeType: 'preservation'
                }
            });

            notified++;
        } catch (err) {
            console.error(`[StreakNudge] Failed for user ${user._id}:`, err.message);
        }
    }

    console.log(`[StreakNudge] Done. Notified ${notified} users.`);
    return { atRisk: atRiskUsers.length, notified };
}

module.exports = { processStreakNudges };

if (require.main === module) {
    require('dotenv').config();
    const connectDB = require('../config/database');

    (async () => {
        try {
            await connectDB();
            const result = await processStreakNudges();
            console.log('[StreakNudge] Result:', result);
            process.exit(0);
        } catch (error) {
            console.error('[StreakNudge] Error:', error);
            process.exit(1);
        }
    })();
}
