const User = require('../models/User');
const { Badge } = require('../models/Gamification');
const EcoPointsTransaction = require('../models/EcoPointsTransaction');
const ActivitySubmission = require('../models/ActivitySubmission');

const APPROVED_ACTIVITY_STATUSES = ['teacher_approved', 'approved'];

async function countApprovedActivities(userId, criteria = {}) {
    const query = {
        user: userId,
        status: { $in: APPROVED_ACTIVITY_STATUSES }
    };

    if (Array.isArray(criteria.activityTypes) && criteria.activityTypes.length > 0) {
        query.activityType = { $in: criteria.activityTypes };
    }

    if (criteria.windowDays) {
        query.createdAt = { $gte: new Date(Date.now() - Number(criteria.windowDays) * 24 * 60 * 60 * 1000) };
    }

    return ActivitySubmission.countDocuments(query);
}

async function countActiveDays(userId, windowDays) {
    const since = new Date(Date.now() - Number(windowDays || 7) * 24 * 60 * 60 * 1000);
    const rows = await ActivitySubmission.aggregate([
        {
            $match: {
                user: userId,
                status: { $in: APPROVED_ACTIVITY_STATUSES },
                createdAt: { $gte: since }
            }
        },
        {
            $project: {
                dateOnly: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            }
        },
        { $group: { _id: '$dateOnly' } },
        { $count: 'total' }
    ]);

    return rows[0]?.total || 0;
}

async function countSeasonalActivities(userId, criteria = {}) {
    const query = {
        user: userId,
        status: { $in: APPROVED_ACTIVITY_STATUSES }
    };

    if (Array.isArray(criteria.activityTypes) && criteria.activityTypes.length > 0) {
        query.activityType = { $in: criteria.activityTypes };
    }

    const rows = await ActivitySubmission.find(query).select('createdAt').lean();
    const months = new Set((criteria.seasonMonths || []).map(Number));
    if (!months.size) return 0;
    return rows.filter((row) => months.has(new Date(row.createdAt).getUTCMonth() + 1)).length;
}

async function getClassRank(user) {
    const schoolId = user.profile?.schoolId;
    const grade = String(user.profile?.grade || '').trim();
    if (!schoolId || !grade) return -1;

    const classmates = await User.find({
        role: 'student',
        'profile.schoolId': schoolId,
        'profile.grade': grade,
        isActive: true
    })
        .select('_id gamification.ecoPoints')
        .sort({ 'gamification.ecoPoints': -1, _id: 1 })
        .lean();

    const idx = classmates.findIndex((row) => String(row._id) === String(user._id));
    return idx === -1 ? -1 : idx + 1;
}

async function checkAndAwardBadges(userId) {
    const user = await User.findById(userId).select('gamification environmentalImpact progress profile');
    if (!user) return;

    const activeBadges = await Badge.find({ isActive: true });

    for (const badge of activeBadges) {
        let metCriteria = false;

        const criteria = badge.criteria || {};

        if (criteria.type === 'points') {
            metCriteria = user.gamification.ecoPoints >= criteria.value;
        } else if (criteria.type === 'streak') {
            metCriteria = user.gamification.streak.longest >= criteria.value;
        } else if (criteria.type === 'quizzes') {
            metCriteria = (user.progress.quizzesTaken?.length || 0) >= criteria.value;
        } else if (criteria.type === 'experiments') {
            metCriteria = (user.progress.experimentsCompleted?.length || 0) >= criteria.value;
        } else if (criteria.type === 'games') {
            metCriteria = (user.progress.gamesPlayed?.length || 0) >= criteria.value;
        } else if (criteria.type === 'water_saved') {
            metCriteria = (user.environmentalImpact?.waterSaved || 0) >= criteria.value;
        } else if (criteria.type === 'plastic_reduced') {
            metCriteria = (user.environmentalImpact?.plasticReduced || 0) >= criteria.value;
        } else if (criteria.type === 'trees_planted') {
            metCriteria = (user.environmentalImpact?.treesPlanted || 0) >= criteria.value;
        } else if (criteria.type === 'quiz_mastery') {
            const quizzes = user.progress?.quizzesTaken || [];
            if (quizzes.length >= criteria.value) {
                const avg = quizzes.reduce((sum, q) => sum + Number(q.score || 0), 0) / quizzes.length;
                metCriteria = avg >= Number(criteria.minAverageScore || 0);
            }
        } else if (criteria.type === 'activities_count' || criteria.type === 'cleanup_events') {
            const count = await countApprovedActivities(user._id, criteria);
            metCriteria = count >= criteria.value;
        } else if (criteria.type === 'active_days') {
            const activeDays = await countActiveDays(user._id, Number(criteria.windowDays || criteria.value));
            metCriteria = activeDays >= criteria.value;
        } else if (criteria.type === 'seasonal_activity') {
            const seasonalCount = await countSeasonalActivities(user._id, criteria);
            metCriteria = seasonalCount >= criteria.value;
        } else if (criteria.type === 'class_rank') {
            const rank = await getClassRank(user);
            metCriteria = rank > 0 && rank <= criteria.value;
        }

        if (metCriteria) {
            const badgeIdStr = badge._id.toString();
            const result = await User.updateOne(
                {
                    _id: userId,
                    "gamification.badges.badgeId": { $ne: badgeIdStr }
                },
                {
                    $push: {
                        "gamification.badges": {
                            badgeId: badgeIdStr,
                            name: badge.name,
                            earnedAt: new Date()
                        }
                    }
                }
            );

            // If badge newly awarded and points included, transaction bonus
            if (result.modifiedCount > 0 && badge.points > 0) {
                await User.updateOne(
                    { _id: userId },
                    { $inc: { "gamification.ecoPoints": badge.points } }
                );

                await EcoPointsTransaction.create({
                    userId: userId,
                    points: badge.points,
                    reason: 'badge-unlock',
                    sourceType: 'achievement',
                    sourceName: badge.name,
                    notes: `Badge ID: ${badgeIdStr}`
                });
            }
        }
    }
}

module.exports = { checkAndAwardBadges };
