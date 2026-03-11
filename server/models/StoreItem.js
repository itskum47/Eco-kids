const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['digital', 'physical', 'voucher', 'badge', 'certificate', 'experience'],
    default: 'digital',
    index: true
  },
  ecoCoinCost: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  stock: {
    type: Number,
    default: -1,
    min: -1
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    deliveryNotes: String,
    sponsor: String
  }
}, { timestamps: true });

storeItemSchema.index({ isActive: 1, ecoCoinCost: 1 });
storeItemSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('StoreItem', storeItemSchema);
