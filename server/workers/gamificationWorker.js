/**
 * PART 1 - W3: Comprehensive BullMQ Gamification Worker
 * 8 Job Handlers: Badges, School Stats, Challenge Prizes, Certificates, Parent Reports, Missions, Digest, Photo AI
 * Executed independently from Express Server (`node workers/gamificationWorker.js`)
 * Prevents CPU spikes from blocking HTTP pipelines.
 */
require('../utils/tracing');
require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { redisClient, cacheService } = require('../services/cacheService');
const connectDB = require('../config/database');
const logger = require('../utils/logger');

connectDB();

const { checkLevelUp } = require('../utils/levelEngine');
const { checkAndAwardBadges } = require('../utils/badgeEngine');
const User = require('../models/User');
const Gamification = require('../models/Gamification');
const Activity = require('../models/Activity');
const School = require('../models/School');
const Challenge = require('../models/Challenge');
const Certificate = require('../models/Certificate');
const ParentReport = require('../models/ParentReport');
const Badge = require('../models/Badge');
const SchoolAggregate = require('../models/SchoolAggregate');
const Notification = require('../models/Notification');
const Redlock = require('redlock');

const redlock = new Redlock([redisClient], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200
});

logger.info('[Worker] Gamification Worker starting with 8 job handlers...');

const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
};

const worker = new Worker('gamificationQueue', async (job) => {
    logger.info(`[Worker] Job ${job.id}: ${job.name}`, job.data);

    try {
        // ========================================
        // JOB 1: Award Badges on Milestones
        // ========================================
        if (job.name === 'award-badges') {
            const checkBadgesUserId = job.data.userId || job.data.studentId;
            if (!checkBadgesUserId) {
                throw new Error('check-badges job missing userId or studentId');
            }

            const student = await User.findById(checkBadgesUserId).select('gamification profile');
            if (!student) {
                throw new Error(`Student ${checkBadgesUserId} not found for badge check`);
            }

            // Acquire distributed lock to prevent race conditions
            const lockValue = `locks:gamification:badges:${checkBadgesUserId}`;
            const lock = await redlock.acquire([lockValue], 5000);

            try {
                // Get all active badges
                const allBadges = await Badge.find({ isActive: true });
                const newBadgesAwarded = [];

                for (const badge of allBadges) {
                    let metCriteria = false;

                    // Evaluate badge criteria based on type
                    if (badge.criteria.type === 'points') {
                        metCriteria = student.gamification.ecoPoints >= badge.criteria.value;
                    } else if (badge.criteria.type === 'streak') {
                        metCriteria = student.gamification.streak.longest >= badge.criteria.value;
                    } else if (badge.criteria.type === 'activities') {
                        metCriteria = (student.progress?.activitiesCompleted?.length || 0) >= badge.criteria.value;
                    } else if (badge.criteria.type === 'quizzes') {
                        metCriteria = (student.progress?.quizzesTaken?.length || 0) >= badge.criteria.value;
                    } else if (badge.criteria.type === 'games') {
                        metCriteria = (student.progress?.gamesPlayed?.length || 0) >= badge.criteria.value;
                    }

                    // Award badge if criteria met and not already owned
                    if (metCriteria) {
                        const badgeIdStr = badge._id.toString();
                        const result = await User.updateOne(
                            {
                                _id: checkBadgesUserId,
                                "gamification.badges.badgeId": { $ne: badgeIdStr }
                            },
                            {
                                $push: {
                                    "gamification.badges": {
                                        badgeId: badgeIdStr,
                                        name: badge.name,
                                        icon: badge.icon,
                                        earnedAt: new Date()
                                    }
                                }
                            }
                        );

                        if (result.modifiedCount > 0) {
                            newBadgesAwarded.push({
                                badgeId: badgeIdStr,
                                name: badge.name,
                                icon: badge.icon
                            });

                            logger.info(`[Worker] Badge "${badge.name}" awarded to student ${checkBadgesUserId}`);

                            // Award bonus points if badge has points reward
                            if (badge.points && badge.points > 0) {
                                await User.updateOne(
                                    { _id: checkBadgesUserId },
                                    { $inc: { "gamification.ecoPoints": badge.points } }
                                );
                            }

                            // Log in AuditLog
                            await AuditLog.create({
                                action: 'BADGE_AWARDED',
                                actor: checkBadgesUserId,
                                target: checkBadgesUserId,
                                metadata: {
                                    badgeId: badgeIdStr,
                                    badgeName: badge.name,
                                    bonusPoints: badge.points || 0
                                }
                            });

                            // Emit Socket.io event to user (via Redis pub/sub)
                            await redisClient.publish("socket-events", JSON.stringify({
                                event: "badge-earned",
                                userId: checkBadgesUserId,
                                data: {
                                    badgeId: badgeIdStr,
                                    badgeName: badge.name,
                                    badgeIcon: badge.icon,
                                    bonusPoints: badge.points || 0,
                                    message: `🎉 You earned the "${badge.name}" badge!`
                                }
                            }));
                        }
                    }
                }

                logger.info(`[Worker] Badge check completed for student ${checkBadgesUserId}. ${newBadgesAwarded.length} new badges awarded.`);
                return { success: true, badgesAwarded: newBadgesAwarded };

            } finally {
                await lock.release();
            }
        }

        // ========================================
        // JOB 2: School Aggregation (Daily)
        // ========================================
        if (job.name === 'school-aggregation') {
            const { schoolId } = job.data;
            const school = await School.findById(schoolId);
            if (!school) throw new Error(`School ${schoolId} not found`);

            const students = await User.find({ schoolId }).select('_id');
            const gamifications = await Gamification.find({ userId: { $in: students.map(s => s._id) } });
            
            const schoolStats = {
                totalEcoPoints: gamifications.reduce((sum, g) => sum + (g.ecoPoints || 0), 0),
                totalStudents: students.length,
                averageEcoPoints: gamifications.length > 0 
                    ? Math.round(gamifications.reduce((sum, g) => sum + (g.ecoPoints || 0), 0) / gamifications.length)
                    : 0,
                aggregatedAt: new Date()
            };

            school.aggregatedStats = schoolStats;
            await school.save();
            logger.info(`[Worker] School aggregation complete for ${schoolId}`);
            return { success: true, schoolStats };
        }

        // ========================================
        // JOB 3: Challenge Prize Distribution
        // ========================================
        if (job.name === 'challenge-prize-distribution') {
            const { challengeId } = job.data;
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) throw new Error(`Challenge ${challengeId} not found`);

            const participants = await Gamification.find({
                userId: { $in: challenge.participants || [] }
            }).sort({ ecoPoints: -1 }).limit(3);

            const prizeDistribution = [
                { rank: 1, bonus: 500, medal: '🥇' },
                { rank: 2, bonus: 300, medal: '🥈' },
                { rank: 3, bonus: 100, medal: '🥉' }
            ];

            for (let i = 0; i < participants.length; i++) {
                const gamification = participants[i];
                const prize = prizeDistribution[i];
                gamification.ecoPoints += prize.bonus;
                if (!gamification.badges) gamification.badges = [];
                gamification.badges.push({
                    badge_id: `challenge_${challenge._id}_${prize.rank}`,
                    name: `${prize.medal} Challenge Winner`,
                    earnedAt: new Date()
                });
                await gamification.save();
            }

            challenge.prizeDistributed = true;
            await challenge.save();
            logger.info(`[Worker] Challenge prizes distributed for ${challengeId}`);
            return { success: true, winnersCount: participants.length };
        }

        // ========================================
        // JOB 4: Certificate Generation
        // ========================================
        if (job.name === 'certificate-generation') {
            const { userId, activityId, certificateType } = job.data;
            const user = await User.findById(userId);
            if (!user) throw new Error(`User ${userId} not found`);

            const certificate = await Certificate.create({
                userId,
                certificateType,
                title: `${certificateType} Certificate`,
                description: `Awarded to ${user.firstName} ${user.lastName}`,
                issued_date: new Date(),
                certificate_number: `CERT-${Date.now()}-${userId}`
            });

            const gamification = await Gamification.findOne({ userId });
            if (gamification) {
                gamification.certificatesEarned = (gamification.certificatesEarned || 0) + 1;
                await gamification.save();
            }

            logger.info(`[Worker] Certificate created: ${certificate._id}`);
            return { success: true, certificateId: certificate._id };
        }

        // ========================================
        // JOB 5: Parent Report Generation
        // ========================================
        if (job.name === 'parent-report-generation') {
            const { studentId, schoolId, reportPeriod } = job.data;
            const student = await User.findById(studentId);
            const activities = await Activity.find({ 
                userId: studentId, 
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
            });
            const gamification = await Gamification.findOne({ userId: studentId });

            const parentReport = await ParentReport.create({
                studentId,
                schoolId,
                reportPeriod: reportPeriod || 'monthly',
                activityMetrics: {
                    totalActivities: activities.length,
                    averageEcoPoints: activities.length > 0
                        ? Math.round(activities.reduce((sum, a) => sum + (a.ecoPoints || 0), 0) / activities.length)
                        : 0
                },
                gamificationMetrics: {
                    ecoPoints: gamification?.ecoPoints || 0,
                    level: gamification?.level || 1,
                    badges: gamification?.badges?.length || 0
                },
                generatedAt: new Date()
            });

            logger.info(`[Worker] Parent report generated: ${parentReport._id}`);
            return { success: true, reportId: parentReport._id };
        }

        // ========================================
        // JOB 6: Weekly Mission Assignment
        // ========================================
        if (job.name === 'weekly-mission-assignment') {
            const activeUsers = await User.find({ role: 'student' }).select('_id');
            const missions = [
                { title: 'Plant a Tree Day', description: 'Submit photo proof', ecoPoints: 200 },
                { title: 'Water Conservation', description: 'Reduce usage by 50%', ecoPoints: 150 },
                { title: 'Plastic-Free Week', description: 'Zero single-use plastics', ecoPoints: 250 },
                { title: 'Energy Saver', description: 'Reduce electricity 30%', ecoPoints: 180 },
                { title: 'Eco Mentor', description: 'Teach 3 friends', ecoPoints: 200 }
            ];

            const randomMission = missions[Math.floor(Math.random() * missions.length)];
            let assignmentCount = 0;

            for (const user of activeUsers) {
                const gamification = await Gamification.findOne({ userId: user._id });
                if (gamification) {
                    if (!gamification.weeklyMissions) gamification.weeklyMissions = [];
                    gamification.weeklyMissions.push({
                        missionId: `mission-${Date.now()}-${user._id}`,
                        ...randomMission,
                        assignedAt: new Date(),
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    });
                    await gamification.save();
                    assignmentCount++;
                }
            }

            logger.info(`[Worker] Weekly missions assigned to ${assignmentCount} users`);
            return { success: true, usersAssigned: assignmentCount };
        }

        // ========================================
        // JOB 7: Daily Digest Email
        // ========================================
        if (job.name === 'daily-digest') {
            const users = await User.find({ role: 'student', dailyDigestEnabled: { $ne: false } }).select('_id firstName');
            let emailsSent = 0;

            for (const user of users) {
                const gamification = await Gamification.findOne({ userId: user._id });
                const activities = await Activity.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);

                const digestContent = {
                    userName: user.firstName,
                    ecoPoints: gamification?.ecoPoints || 0,
                    level: gamification?.level || 1,
                    recentActivities: activities.map(a => ({ title: a.title, points: a.ecoPoints })),
                    generatedAt: new Date()
                };

                // TODO: Integrate with SendGrid/AWS SES for email sending
                logger.info(`[Worker] Digest prepared for user: ${user._id}`);
                emailsSent++;
            }

            logger.info(`[Worker] Daily digests prepared for ${emailsSent} users`);
            return { success: true, emailsSent };
        }

        // ========================================
        // JOB 8: AI Photo Verification
        // ========================================
        if (job.name === 'photo-ai-verification') {
            const { submissionId, photoUrl, userId } = job.data;
            
            // TODO: Integrate with Google Cloud Vision or AWS Rekognition
            // Placeholder: 80% approval rate
            const isApproved = Math.random() > 0.2;
            const ecoPointsAwarded = isApproved ? 150 : 0;

            const gamification = await Gamification.findOne({ userId });
            if (gamification && isApproved) {
                gamification.ecoPoints += ecoPointsAwarded;
                await gamification.save();
            }

            // Emit socket event
            if (global.io) {
                global.io.to(`user-${userId}`).emit('photo-verification', { 
                    submissionId, 
                    isApproved, 
                    ecoPointsAwarded 
                });
            }

            logger.info(`[Worker] Photo verification for ${submissionId}: ${isApproved ? 'APPROVED' : 'REJECTED'}`);
            return { success: true, isApproved, ecoPointsAwarded };
        }

        throw new Error(`Unknown job type: ${job.name}`);
    } catch (error) {
        logger.error(`[Worker] Job ${job.id} Failed:`, error);
        throw error; // Re-throw allowing BullMQ retry mechanisms to catch it
    }
}, {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
        max: 50,
        duration: 1000
    }
});

worker.on('failed', async (job, err) => {
    logger.error(`[Worker] Job ${job.id} has failed entirely: ${err.message}`);
    try {
        // Store in DLQ for manual review
        await redisClient.lpush('gamification-dead-letter-queue', JSON.stringify({
            originalJobId: job.id,
            jobName: job.name,
            jobData: job.data,
            error: err.message,
            failedAt: new Date()
        }));
    } catch (dlqErr) {
        logger.error(`[Worker] Failed to push job ${job.id} to DLQ:`, dlqErr);
    }
});

worker.on('completed', (job) => {
    logger.info(`[Worker] ✅ Job completed: ${job.name} (ID: ${job.id})`);
});

worker.on('error', (err) => {
    logger.error('[Worker] Worker error:', err);
});

worker.on('stalled', (jobId) => {
    logger.warn(`[Worker] Job stalled: ${jobId}`);
});

const SHUTDOWN_TIMEOUT = 25000; // 25 seconds

// Graceful Shutdown specific for the standalone worker
const gracefulWorkerShutdown = async (signal) => {
    logger.info(`[Worker] Received ${signal}. Starting graceful shutdown...`);

    const forceExit = setTimeout(() => {
        logger.error('[Worker] Shutdown timeout exceeded. Forcing exit.');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    try {
        await worker.pause(true);
        logger.info('[Worker] Worker paused.');

        await worker.close();
        logger.info('[Worker] Worker closed.');

        await mongoose.disconnect();
        await redisClient.quit();
        logger.info('[Worker] All connections closed.');

        clearTimeout(forceExit);

        logger.info('[Worker] Shutdown complete.');
        process.exit(0);
    } catch (err) {
        logger.error('[Worker] Shutdown error:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulWorkerShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulWorkerShutdown('SIGINT'));

const healthCheck = async () => {
    // Basic health check for Docker container
    // If the event loop is blocked, this won't even respond, correctly failing the health script
    return { status: 'ok', uptime: process.uptime() };
};

module.exports = { ...(module.exports || {}), healthCheck };
