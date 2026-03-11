const mongoose = require('mongoose');

const EcoPointsTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must have a user'],
    index: true
  },
  points: {
    type: Number,
    required: [true, 'Please provide points amount'],
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000']
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for points'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  sourceType: {
    type: String,
    enum: ['lesson', 'activity', 'habit', 'challenge', 'achievement'],
    required: [true, 'Please specify source type'],
    index: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  sourceName: {
    type: String,
    maxlength: [200, 'Source name cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'rejected'],
    default: 'completed',
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient transaction history queries
EcoPointsTransactionSchema.index({ userId: 1, createdAt: -1 });

// Post-save hook: Auto-increment user's ecoPointsTotal when transaction is completed
EcoPointsTransactionSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    try {
      await mongoose.model('User').findByIdAndUpdate(
        doc.userId,
        { $inc: { ecoPointsTotal: doc.points } },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating user eco points:', error);
    }
  }
});

module.exports = mongoose.model('EcoPointsTransaction', EcoPointsTransactionSchema);
