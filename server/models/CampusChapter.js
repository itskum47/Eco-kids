const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 600
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['proposed', 'pending_review', 'active', 'archived'],
    default: 'proposed',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['captain', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const CampusChapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true,
    maxlength: [100, 'Chapter name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  institutionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },
  members: [MemberSchema],
  missions: [MissionSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Ensure one chapter per institution (can be relaxed later)
CampusChapterSchema.index({ institutionId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('CampusChapter', CampusChapterSchema);
