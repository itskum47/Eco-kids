const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  storeItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItem',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  ecoCoinsSpent: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'rejected', 'refunded'],
    default: 'pending',
    index: true
  },
  redemptionCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 300
  },
  fulfilledAt: Date,
  refundedAt: Date
}, { timestamps: true });

redemptionSchema.index({ user: 1, createdAt: -1 });
redemptionSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Redemption', redemptionSchema);
