const User = require('../models/User');
const { Level } = require('../models/Gamification');

async function checkLevelUp(userId) {
    const user = await User.findById(userId).select('gamification.ecoPoints gamification.level');
    if (!user) return;

    const newLevelDoc = await Level.findOne({
        minPoints: { $lte: user.gamification.ecoPoints }
    }).sort({ level: -1 });

    if (newLevelDoc && newLevelDoc.level > user.gamification.level) {
        const newLevel = newLevelDoc.level;
        await User.updateOne(
            {
                _id: userId,
                "gamification.level": { $lt: newLevel }
            },
            {
                $set: { "gamification.level": newLevel }
            }
        );
    }
}

module.exports = { checkLevelUp };
