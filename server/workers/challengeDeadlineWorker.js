/**
 * Challenge Deadline Reminder Worker
 * Runs daily: sends reminders to students in active challenges ending within 48 hours.
 *
 * Run: node workers/challengeDeadlineWorker.js
 */

const InterSchoolChallenge = require('../models/InterSchoolChallenge');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function processChallengeDeadlines() {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    console.log(`[ChallengeDeadline] Running at ${now.toISOString()}`);

    // Find active challenges ending within 48 hours
    const endingSoon = await InterSchoolChallenge.find({
        status: 'active',
        endsAt: { $gte: now, $lte: in48h }
    }).lean();

    if (endingSoon.length === 0) {
        console.log('[ChallengeDeadline] No challenges ending soon.');
        return { processed: 0, notified: 0 };
    }

    console.log(`[ChallengeDeadline] Found ${endingSoon.length} challenges ending within 48h`);

    let notified = 0;

    for (const challenge of endingSoon) {
        const hoursLeft = Math.ceil((challenge.endsAt - now) / (60 * 60 * 1000));

        // Get participating school IDs
        const schoolIds = challenge.schools.map(s => s.schoolId);

        // Find students from participating schools
        const students = await User.find({
            role: 'student',
            isActive: true,
            'profile.school': { $in: challenge.schools.map(s => s.schoolName) }
        }).select('_id').lean();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        for (const student of students) {
            try {
                // Check if already notified today
                const existing = await Notification.findOne({
                    userId: student._id,
                    type: 'system',
                    'data.challengeId': challenge._id.toString(),
                    createdAt: { $gte: todayStart }
                });

                if (existing) continue;

                await Notification.create({
                    userId: student._id,
                    type: 'system',
                    title: '⏰ Challenge Ending Soon!',
                    message: `"${challenge.title}" ends in ${hoursLeft} hours! Submit your activities now to boost your school's ranking!`,
                    data: {
                        challengeId: challenge._id.toString(),
                        challengeTitle: challenge.title,
                        hoursRemaining: hoursLeft,
                        reminderType: 'challenge_deadline'
                    }
                });

                notified++;
            } catch (err) {
                // Skip individual notification failures
            }
        }
    }

    console.log(`[ChallengeDeadline] Done. Notified ${notified} students.`);
    return { processed: endingSoon.length, notified };
}

module.exports = { processChallengeDeadlines };

if (require.main === module) {
    require('dotenv').config();
    const connectDB = require('../config/database');

    (async () => {
        try {
            await connectDB();
            const result = await processChallengeDeadlines();
            console.log('[ChallengeDeadline] Result:', result);
            process.exit(0);
        } catch (error) {
            console.error('[ChallengeDeadline] Error:', error);
            process.exit(1);
        }
    })();
}
