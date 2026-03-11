/**
 * generateWeeklyMissions.js
 * BullMQ cron that fires every Monday at 6 AM IST
 * Generates personalized weekly missions for each active student
 * Registered in server.js on startup
 */
const { Queue, Worker } = require('bullmq');
const { queueRedis } = require('../services/cacheService');
const User = require('../models/User');
const StudentWeeklyMission = require('../models/StudentWeeklyMission');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityFeed = require('../models/ActivityFeed');
const logger = require('../utils/logger');

const missionQueue = new Queue('WeeklyMissionQueue', { connection: queueRedis });

/**
 * Register the repeatable cron job
 * Fires at Monday 6 AM IST (Sunday 00:30 UTC)
 */
const scheduleWeeklyMissionJob = async () => {
    await missionQueue.add(
        'generate-weekly-missions',
        {},
        {
            repeat: { pattern: '30 0 * * 0' }, // Sunday 00:30 UTC = Monday 6 AM IST
            jobId: 'weekly-mission-cron'
        }
    );
    logger.info('[WeeklyMissionQueue] Cron job registered: Monday 6 AM IST');
};

/**
 * Helper: Get the start of the Monday in IST
 */
function getMondayIST() {
    const now = new Date();
    const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // Add 5:30 hours for IST
    
    // Get Monday of current week (if today is Monday, get today)
    const dayOfWeek = istDate.getDay();
    const daysToMonday = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : dayOfWeek - 1);
    
    const monday = new Date(istDate);
    monday.setDate(monday.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    return monday;
}

/**
 * Helper: Get Sunday 23:59 IST of the same week
 */
function getSundayEndIST(mondayStart) {
    const sunday = new Date(mondayStart);
    sunday.setDate(sunday.getDate() + 6); // Add 6 days to get to Sunday
    sunday.setHours(23, 59, 59, 999);
    return sunday;
}

/**
 * Worker that generates missions for all active students
 */
const missionWorker = new Worker('WeeklyMissionQueue', async (job) => {
    if (job.name !== 'generate-weekly-missions') return;

    logger.info('[WeeklyMissionManager] Starting weekly mission generation...');

    try {
        const weekStartIST = getMondayIST();
        const weekEndIST = getSundayEndIST(weekStartIST);

        // Fetch all active students (process in batches of 100)
        const batchSize = 100;
        let skip = 0;
        let processed = 0;
        let generated = 0;
        let skipped = 0;

        while (true) {
            const students = await User.find({
                role: 'student',
                isActive: true,
                deletedAt: null
            })
                .select('_id name gamification school')
                .limit(batchSize)
                .skip(skip)
                .lean();

            if (students.length === 0) break;

            for (const student of students) {
                try {
                    // Check if missions already exist for this week
                    const existing = await StudentWeeklyMission.findOne({
                        user: student._id,
                        weekStartDate: weekStartIST
                    });

                    if (existing) {
                        skipped++;
                        processed++;
                        continue;
                    }

                    // Generate 3 personalized missions
                    const missions = await generatePersonalizedMissions(student, weekStartIST);

                    if (missions.length === 0) {
                        skipped++;
                        processed++;
                        continue;
                    }

                    // Create StudentWeeklyMission record
                    const totalReward = missions.reduce((sum, m) => sum + m.reward, 0);
                    await StudentWeeklyMission.create({
                        user: student._id,
                        weekStartDate: weekStartIST,
                        expiresAt: weekEndIST,
                        missions,
                        totalReward
                    });

                    generated++;
                    processed++;

                    if (processed % 50 === 0) {
                        logger.info(`[WeeklyMissionManager] Processed ${processed} students, Generated: ${generated}`);
                    }
                } catch (err) {
                    logger.warn(`[WeeklyMissionManager] Error generating missions for student ${student._id}:`, err.message);
                    processed++;
                }
            }

            skip += batchSize;
        }

        logger.info(`[WeeklyMissionManager] Mission generation complete. Processed: ${processed}, Generated: ${generated}, Skipped: ${skipped}`);

    } catch (err) {
        logger.error('[WeeklyMissionManager] Error during mission generation:', err);
        throw err;
    }
}, { connection: queueRedis });

missionWorker.on('failed', (job, err) => {
    logger.error(`[WeeklyMissionManager] Job ${job?.id} failed:`, err);
});

/**
 * Generate 3 personalized missions for a student
 * Uses deterministic rules based on recent activity
 */
async function generatePersonalizedMissions(student, weekStartIST) {
    const missions = [];
    const weekAgoIST = new Date(weekStartIST.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
        // ─────────────────────────────────────────────────────────
        // RULE 1: Knowledge Mission
        // Find topic where quiz score is < 60%
        // ─────────────────────────────────────────────────────────
        const quizzesByTopic = await QuizAttempt.aggregate([
            {
                $match: {
                    userId: student._id,
                    createdAt: { $gte: weekAgoIST }
                }
            },
            {
                $group: {
                    _id: '$topic',
                    avgScore: { $avg: '$score' },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { avgScore: { $lt: 60 } }
            },
            {
                $sort: { avgScore: 1 }
            },
            {
                $limit: 1
            }
        ]);

        if (quizzesByTopic.length > 0) {
            const weakTopic = quizzesByTopic[0];
            missions.push({
                title: `📚 Master ${weakTopic._id}`,
                description: `Complete 2 ${weakTopic._id} quizzes and score above 70%`,
                icon: '📚',
                reward: 30,
                progress: 0,
                target: 2,
                completed: false
            });
        } else {
            // Fallback: generic knowledge mission
            missions.push({
                title: '🌍 Explore Biodiversity',
                description: 'Take a quiz on Biodiversity and earn eco-points',
                icon: '🌍',
                reward: 30,
                progress: 0,
                target: 1,
                completed: false
            });
        }

        // ─────────────────────────────────────────────────────────
        // RULE 2: Action Mission
        // Find activity type not attempted this week
        // ─────────────────────────────────────────────────────────
        const attemptedActivities = await ActivityFeed.distinct('activityType', {
            user: student._id,
            createdAt: { $gte: weekStartIST }
        });

        const allActivityTypes = [
            'tree-planting',
            'waste-recycling',
            'water-saving',
            'energy-saving',
            'plastic-reduction',
            'composting',
            'biodiversity-survey'
        ];

        const unattempledActivities = allActivityTypes.filter(type => !attemptedActivities.includes(type));

        if (unattempledActivities.length > 0) {
            const selectedActivity = unattempledActivities[0];
            const activityEmoji = {
                'tree-planting': '🌳',
                'waste-recycling': '♻️',
                'water-saving': '💧',
                'energy-saving': '⚡',
                'plastic-reduction': '🛍️',
                'composting': '🍂',
                'biodiversity-survey': '🦋'
            };

            missions.push({
                title: `${activityEmoji[selectedActivity]} ${selectedActivity.replace('-', ' ')}`,
                description: `Submit 1 ${selectedActivity.replace('-', ' ')} activity with photo proof`,
                icon: activityEmoji[selectedActivity],
                reward: 50,
                progress: 0,
                target: 1,
                completed: false
            });
        } else {
            // Fallback: generic action mission
            missions.push({
                title: '📸 Submit an Eco-Activity',
                description: 'Submit any eco-activity with a photo for verification',
                icon: '📸',
                reward: 50,
                progress: 0,
                target: 1,
                completed: false
            });
        }

        // ─────────────────────────────────────────────────────────
        // RULE 3: Social Mission (always the same each week)
        // ─────────────────────────────────────────────────────────
        missions.push({
            title: '💬 Community Eco-Feed',
            description: 'React with emojis to 3 posts in the Eco-Feed',
            icon: '💬',
            reward: 15,
            progress: 0,
            target: 3,
            completed: false
        });

        return missions;

    } catch (err) {
        logger.warn(`[WeeklyMissionManager] Error generating missions for student ${student._id}:`, err);
        return [];
    }
}

module.exports = { missionQueue, scheduleWeeklyMissionJob };
