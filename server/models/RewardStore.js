const mongoose = require('mongoose');

const rewardItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['digital', 'physical'], required: true },
    category: { type: String, enum: ['certificate', 'badge', 'merchandise', 'voucher', 'experience'], default: 'certificate' },
    costPoints: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: -1 }, // -1 = unlimited (digital)
    imageUrl: String,
    isActive: { type: Boolean, default: true },
    metadata: {
        sponsor: String,
        deliveryDays: Number,
        termsUrl: String,
    },
}, { timestamps: true });

rewardItemSchema.index({ isActive: 1, costPoints: 1 });
rewardItemSchema.index({ type: 1, category: 1 });

const redemptionRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rewardItem: { type: mongoose.Schema.Types.ObjectId, ref: 'RewardItem', required: true },
    pointsDeducted: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'fulfilled', 'rejected', 'refunded'], default: 'pending' },
    idempotencyKey: { type: String, required: true, unique: true },
    fulfillment: {
        method: String,
        trackingId: String,
        fulfilledAt: Date,
        fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    rejectionReason: String,
    refundedAt: Date,
}, { timestamps: true });

redemptionRequestSchema.index({ user: 1, status: 1, createdAt: -1 });
redemptionRequestSchema.index({ status: 1, createdAt: 1 });
redemptionRequestSchema.index({ idempotencyKey: 1 }, { unique: true });

module.exports = {
    RewardItem: mongoose.model('RewardItem', rewardItemSchema),
    RedemptionRequest: mongoose.model('RedemptionRequest', redemptionRequestSchema),
};
