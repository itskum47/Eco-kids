const mongoose = require('mongoose');

const ContentReportSchema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content_type: {
      type: String,
      enum: ['lesson', 'quiz'],
      required: true,
      index: true
    },
    content_id: {
      type: String,
      required: true,
      index: true
    },
    question_id: {
      type: String,
      default: null,
      index: true
    },
    report_text: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Report must be at least 10 characters long'],
      maxlength: [2000, 'Report cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed'],
      default: 'open',
      index: true
    },
    admin_note: {
      type: String,
      default: '',
      maxlength: [1000, 'Admin note cannot exceed 1000 characters']
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewed_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

ContentReportSchema.index({ status: 1, created_at: 1 });
ContentReportSchema.index({ content_type: 1, content_id: 1, created_at: -1 });

module.exports = mongoose.model('ContentReport', ContentReportSchema);