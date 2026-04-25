const { validationResult } = require('express-validator');
const crypto = require('crypto');
const StoreItem = require('../models/StoreItem');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const ActivitySubmission = require('../models/ActivitySubmission');
const { featureFlags } = require('../config/featureFlags');

const ensureEnabled = (res) => {
  const ecoStoreEnabled =
    process.env.FEATURE_ECO_STORE !== 'false' &&
    process.env.FEATURE_STORE !== 'false';

  if (!ecoStoreEnabled) {
    res.status(403).json({
      success: false,
      message: 'Eco Store is currently disabled'
    });
    return false;
  }
  return true;
};

exports.listItems = async (req, res) => {
  try {
    if (!ensureEnabled(res)) return;

    const items = await StoreItem.find({ isActive: true })
      .sort({ ecoCoinCost: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load store items',
      error: error.message
    });
  }
};

exports.redeemItem = async (req, res) => {
  try {
    if (!ensureEnabled(res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { storeItemId, quantity = 1, note } = req.body;
    const userId = req.user.id;

    const riskWindowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await ActivitySubmission.find({
      user: userId,
      createdAt: { $gte: riskWindowStart }
    }).select('status flags').lean();

    const totalSubmissions = recentSubmissions.length;
    const flaggedSubmissions = recentSubmissions.filter((s) => Array.isArray(s.flags) && s.flags.length > 0).length;
    const rejectedSubmissions = recentSubmissions.filter((s) => ['rejected', 'teacher_rejected', 'appeal_rejected'].includes(s.status)).length;
    const rejectionRatio = totalSubmissions > 0 ? rejectedSubmissions / totalSubmissions : 0;

    const riskReasons = [];
    if (flaggedSubmissions >= 3) riskReasons.push('multiple_flagged_submissions_30d');
    if (totalSubmissions >= 5 && rejectionRatio >= 0.6) riskReasons.push('high_rejection_ratio_30d');

    const riskScore = Math.min(
      100,
      Math.round(
        (Math.min(flaggedSubmissions, 5) * 15) +
        ((totalSubmissions >= 5 ? rejectionRatio : 0) * 50)
      )
    );

    if (riskScore >= 70) {
      return res.status(403).json({
        success: false,
        message: 'Redemption temporarily blocked due to risk checks. Contact your teacher/admin for review.',
        riskScore,
        riskReasons
      });
    }

    const item = await StoreItem.findOne({ _id: storeItemId, isActive: true });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Store item not found'
      });
    }

    if (item.stock !== -1 && item.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const availableCoins = typeof user.ecoCoins === 'number'
      ? user.ecoCoins
      : (user.gamification?.ecoPoints || 0);

    if (typeof user.ecoCoins !== 'number') {
      user.ecoCoins = availableCoins;
      await user.save();
    }

    const totalCost = item.ecoCoinCost * quantity;
    if (availableCoins < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient eco coins',
        available: availableCoins,
        required: totalCost
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        ecoCoins: { $gte: totalCost }
      },
      {
        $inc: {
          ecoCoins: -totalCost,
          'gamification.ecoPoints': -totalCost
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Unable to redeem item at this time'
      });
    }

    if (item.stock !== -1) {
      await StoreItem.findByIdAndUpdate(item._id, { $inc: { stock: -quantity } });
    }

    const redemptionCode = `ECO-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const requiresManualApproval = riskScore >= 40 || item.category !== 'digital';

    const redemption = await Redemption.create({
      user: userId,
      storeItem: item._id,
      quantity,
      ecoCoinsSpent: totalCost,
      status: requiresManualApproval ? 'pending' : 'fulfilled',
      redemptionCode,
      note,
      fulfilledAt: requiresManualApproval ? undefined : new Date(),
      riskScore,
      riskReasons
    });

    return res.status(201).json({
      success: true,
      data: redemption,
      balance: updatedUser.ecoCoins
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to redeem item',
      error: error.message
    });
  }
};

exports.myRedemptions = async (req, res) => {
  try {
    if (!ensureEnabled(res)) return;

    const redemptions = await Redemption.find({ user: req.user.id })
      .populate('storeItem', 'name category ecoCoinCost imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: redemptions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load redemption history',
      error: error.message
    });
  }
};

exports.updateRedemptionStatus = async (req, res) => {
  try {
    if (!ensureEnabled(res)) return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, note } = req.body;
    const redemption = await Redemption.findById(req.params.id);

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found'
      });
    }

    if (status === 'rejected' && redemption.status !== 'refunded') {
      await User.findByIdAndUpdate(redemption.user, {
        $inc: {
          ecoCoins: redemption.ecoCoinsSpent,
          'gamification.ecoPoints': redemption.ecoCoinsSpent
        }
      });
      redemption.status = 'refunded';
      redemption.refundedAt = new Date();
    } else {
      redemption.status = status;
      if (status === 'fulfilled') {
        redemption.fulfilledAt = new Date();
      }
    }

    if (note) {
      redemption.note = note;
    }

    await redemption.save();

    return res.status(200).json({
      success: true,
      data: redemption
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update redemption status',
      error: error.message
    });
  }
};
