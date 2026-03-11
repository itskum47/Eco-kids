const { RewardItem, RedemptionRequest } = require('../models/RewardStore');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    List available rewards
// @route   GET /api/rewards
exports.listRewards = asyncHandler(async (req, res) => {
    const items = await RewardItem.find({ isActive: true })
        .sort({ costPoints: 1 })
        .lean();
    res.json({ success: true, data: items });
});

// @desc    Redeem a reward
// @route   POST /api/rewards/redeem
exports.redeemReward = asyncHandler(async (req, res) => {
    const { rewardItemId, idempotencyKey } = req.body;
    if (!idempotencyKey) {
        return res.status(400).json({ success: false, message: 'idempotencyKey required' });
    }

    // Idempotency check
    const existing = await RedemptionRequest.findOne({ idempotencyKey }).lean();
    if (existing) {
        return res.json({ success: true, data: existing, idempotent: true });
    }

    const item = await RewardItem.findById(rewardItemId);
    if (!item || !item.isActive) {
        return res.status(404).json({ success: false, message: 'Reward not found or inactive' });
    }

    if (item.stock !== -1 && item.stock <= 0) {
        return res.status(400).json({ success: false, message: 'Out of stock' });
    }

    const user = await User.findById(req.user._id);
    if (user.gamification.ecoPoints < item.costPoints) {
        return res.status(400).json({
            success: false,
            message: 'Insufficient eco-points',
            required: item.costPoints,
            available: user.gamification.ecoPoints,
        });
    }

    // Atomic deduction
    const updated = await User.findOneAndUpdate(
        { _id: req.user._id, 'gamification.ecoPoints': { $gte: item.costPoints } },
        { $inc: { 'gamification.ecoPoints': -item.costPoints } },
        { new: true }
    );

    if (!updated) {
        return res.status(400).json({ success: false, message: 'Insufficient points (race condition prevented)' });
    }

    // Decrement stock (if not unlimited)
    if (item.stock !== -1) {
        await RewardItem.findByIdAndUpdate(rewardItemId, { $inc: { stock: -1 } });
    }

    const request = await RedemptionRequest.create({
        user: req.user._id,
        rewardItem: rewardItemId,
        pointsDeducted: item.costPoints,
        idempotencyKey,
        status: item.type === 'digital' ? 'fulfilled' : 'pending',
        fulfillment: item.type === 'digital' ? { method: 'instant', fulfilledAt: new Date() } : undefined,
    });

    res.status(201).json({ success: true, data: request });
});

// @desc    Admin: Update redemption status (approve/reject/fulfill)
// @route   PUT /api/rewards/redemptions/:id
exports.updateRedemption = asyncHandler(async (req, res) => {
    const { status, rejectionReason, trackingId } = req.body;
    const request = await RedemptionRequest.findById(req.params.id);
    if (!request) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }

    // Refund on rejection
    if (status === 'rejected' && request.status !== 'refunded') {
        await User.findByIdAndUpdate(request.user, {
            $inc: { 'gamification.ecoPoints': request.pointsDeducted },
        });
        request.refundedAt = new Date();
        request.rejectionReason = rejectionReason || 'Rejected by admin';
        request.status = 'refunded';
    } else if (status === 'fulfilled') {
        request.status = 'fulfilled';
        request.fulfillment = {
            method: 'manual',
            trackingId,
            fulfilledAt: new Date(),
            fulfilledBy: req.user._id,
        };
    } else {
        request.status = status;
    }

    await request.save();
    res.json({ success: true, data: request });
});

// @desc    My redemption history
// @route   GET /api/rewards/my-redemptions
exports.myRedemptions = asyncHandler(async (req, res) => {
    const requests = await RedemptionRequest.find({ user: req.user._id })
        .populate('rewardItem', 'name type costPoints imageUrl')
        .sort({ createdAt: -1 })
        .lean();
    res.json({ success: true, data: requests });
});
