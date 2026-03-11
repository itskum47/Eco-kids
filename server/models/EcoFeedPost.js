const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    enum: ['🌱', '💧', '♻️', '🌍', '🔥'],
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  count: {
    type: Number,
    default: 1
  }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: null
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const EcoFeedPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorAvatar: {
    type: String,
    default: null
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  activityType: {
    type: String,
    enum: ['tree-planting', 'waste-recycling', 'water-saving', 'energy-saving', 'plastic-reduction', 'composting', 'biodiversity-survey', 'general'],
    default: 'general'
  },
  photoUrl: {
    type: String,
    default: null
  },
  caption: {
    type: String,
    required: true,
    maxlength: 500
  },
  ecoPointsEarned: {
    type: Number,
    default: 0
  },
  reactions: [reactionSchema],
  comments: [commentSchema],
  isVisible: {
    type: Boolean,
    default: true
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
}, {
  timestamps: true
});

// Indexes for efficient querying
EcoFeedPostSchema.index({ school: 1, createdAt: -1 });
EcoFeedPostSchema.index({ author: 1, createdAt: -1 });
EcoFeedPostSchema.index({ isVisible: 1, createdAt: -1 });

// Helper method to get reaction counts
EcoFeedPostSchema.methods.getReactionSummary = function () {
  const summary = {};
  this.reactions.forEach(reaction => {
    summary[reaction.emoji] = reaction.count;
  });
  return summary;
};

module.exports = mongoose.model('EcoFeedPost', EcoFeedPostSchema);
