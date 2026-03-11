const mongoose = require('mongoose');

const SafetyReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subjectType: {
      type: String,
      enum: ['feed_post', 'feed_comment', 'activity_submission', 'user_profile', 'other'],
      required: true,
      index: true
    },
    subjectId: {
      type: String,
      required: true,
      index: true
    },
    reason: {
      type: String,
      enum: ['harassment', 'sexual_content', 'bullying', 'self_harm', 'abuse', 'other'],
      required: true
    },
    details: {
      type: String,
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'rejected'],
      default: 'open',
      index: true
    },
    moderationNotes: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    riskScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 3
    }
  },
  { timestamps: true }
);

SafetyReportSchema.index({ subjectType: 1, subjectId: 1, createdAt: -1 });
SafetyReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SafetyReport', SafetyReportSchema);
