/**
 * Points Decay Worker
 * Runs monthly on the 1st: applies 10% decay to inactive users.
 *
 * Run standalone: node workers/pointsDecayWorker.js
 */

const User = require('../models/User');
const Notification = require('../models/Notification');

const DECAY_RATE = 0.10; // 10%
const FLOOR_POINTS = 100; // Minimum points after decay
const INACTIVITY_DAYS = 30;

async function processPointsDecay() {
    const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

    console.log(`[PointsDecay] Running. Cutoff: ${cutoff.toISOString()}`);

    // Find users with zero activity in last 30 days
    const inactiveUsers = await User.find({
        isActive: true,
        role: 'student',
        'gamification.ecoPointsTotal': { $gt: FLOOR_POINTS },
        $or: [
            { lastLogin: { $lt: cutoff } },
            { lastLogin: null }
        ]
    }).select('_id name gamification.ecoPointsTotal').lean();

    console.log(`[PointsDecay] Found ${inactiveUsers.length} inactive students`);

    let decayed = 0;

    for (const user of inactiveUsers) {
        const currentPoints = user.gamification?.ecoPointsTotal || 0;
        const decayAmount = Math.floor(currentPoints * DECAY_RATE);
        const newPoints = Math.max(currentPoints - decayAmount, FLOOR_POINTS);

        if (newPoints < currentPoints) {
            await User.findByIdAndUpdate(user._id, {
                $set: { 'gamification.ecoPointsTotal': newPoints }
            });

            // Notify user
            try {
                await Notification.create({
                    userId: user._id,
                    type: 'points_decay',
                    title: 'Eco-Points Decay',
                    message: `Your eco-points decreased by ${decayAmount} due to 30 days of inactivity. Stay active to keep your points!`,
                    metadata: { previousPoints: currentPoints, newPoints, decayAmount },
                    read: false
                });
            } catch (err) {
                // Skip notification errors
            }

            decayed++;
        }
    }

    console.log(`[PointsDecay] Done. Decayed ${decayed} users.`);
    return { processed: inactiveUsers.length, decayed };
}

module.exports = { processPointsDecay };

if (require.main === module) {
    require('dotenv').config();
    const connectDB = require('../config/database');

    (async () => {
        try {
            await connectDB();
            const result = await processPointsDecay();
            console.log('[PointsDecay] Result:', result);
            process.exit(0);
        } catch (error) {
            console.error('[PointsDecay] Error:', error);
            process.exit(1);
        }
    })();
}
