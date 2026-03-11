const mongoose = require('mongoose');

const DailyChallengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ecoPointsReward: { type: Number, required: true, min: 0, default: 50 },
    challengeDate: { type: String, required: true, unique: true }, // YYYY-MM-DD in IST
    expiresAt: { type: Date, required: true },
    completedBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        completedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('DailyChallenge', DailyChallengeSchema);
