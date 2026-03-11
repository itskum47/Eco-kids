const User = require('../models/User');
const { Badge } = require('../models/Gamification');
const EcoPointsTransaction = require('../models/EcoPointsTransaction');

async function checkAndAwardBadges(userId) {
    const user = await User.findById(userId).select('gamification environmentalImpact progress');
    if (!user) return;

    const activeBadges = await Badge.find({ isActive: true });

    for (const badge of activeBadges) {
        let metCriteria = false;

        if (badge.criteria.type === 'points') {
            metCriteria = user.gamification.ecoPoints >= badge.criteria.value;
        } else if (badge.criteria.type === 'streak') {
            metCriteria = user.gamification.streak.longest >= badge.criteria.value;
        } else if (badge.criteria.type === 'quizzes') {
            metCriteria = (user.progress.quizzesTaken?.length || 0) >= badge.criteria.value;
        } else if (badge.criteria.type === 'experiments') {
            metCriteria = (user.progress.experimentsCompleted?.length || 0) >= badge.criteria.value;
        } else if (badge.criteria.type === 'games') {
            metCriteria = (user.progress.gamesPlayed?.length || 0) >= badge.criteria.value;
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
