const asyncHandler = require('../middleware/async');
const DailyChallenge = require('../models/DailyChallenge');
const GamificationService = require('../services/gamificationService');

// Get today's date in IST as YYYY-MM-DD
const todayIST = () => {
    const now = new Date();
    // IST = UTC+5:30
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().slice(0, 10);
};

// @desc   Get today's daily challenge
// @route  GET /api/v1/challenges/daily
// @access Private
exports.getDailyChallenge = asyncHandler(async (req, res) => {
    const today = todayIST();
    const challenge = await DailyChallenge.findOne({ challengeDate: today })
        .lean();

    if (!challenge) {
        return res.status(404).json({ success: false, message: 'No challenge available today. Check back soon!' });
    }

    // Check if this user already completed it
    const alreadyDone = challenge.completedBy?.some(
        c => c.user.toString() === req.user.id
    );

    res.status(200).json({
        success: true,
        data: {
            ...challenge,
            alreadyCompleted: alreadyDone,
            completedBy: undefined // don't expose full list to clients
        }
    });
});

// @desc   Mark today's challenge as complete for user (once per day)
// @route  POST /api/v1/challenges/daily/complete
// @access Private
exports.completeDailyChallenge = asyncHandler(async (req, res) => {
    const today = todayIST();
    const challenge = await DailyChallenge.findOne({ challengeDate: today });

    if (!challenge) {
        return res.status(404).json({ success: false, message: 'No active challenge found for today' });
    }

    // Idempotency: prevent double-claiming
    const alreadyDone = challenge.completedBy.some(
        c => c.user.toString() === req.user.id
    );

    if (alreadyDone) {
        return res.status(409).json({
            success: false,
            message: 'You have already completed today\'s challenge!'
        });
    }

    // Award points atomically
    const gamificationService = new GamificationService();
    const pointsReward = challenge.ecoPointsReward || 50;

    await gamificationService.awardPoints(
        req.user.id,
        pointsReward,
        'daily_challenge',
        `Completed daily challenge: ${challenge.title}`
    );

    // Mark as completed
    challenge.completedBy.push({ user: req.user.id, completedAt: new Date() });
    await challenge.save();

    res.status(200).json({
        success: true,
        message: `🎉 Challenge completed! +${pointsReward} EcoPoints awarded!`,
        data: {
            pointsAwarded: pointsReward,
            challengeTitle: challenge.title
        }
    });
});
