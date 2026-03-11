const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    points: Number
  }],
  completedAt: {
    type: Date
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
QuizAttemptSchema.index({ userId: 1, createdAt: -1 });
QuizAttemptSchema.index({ quizId: 1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
