const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  topic: {
    type: mongoose.Schema.ObjectId,
    ref: 'Topic',
    required: [true, 'Quiz must be associated with a topic']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'air-pollution',
      'water-conservation',
      'biodiversity',
      'climate-change',
      'waste-management',
      'renewable-energy',
      'soil-health',
      'forest-conservation'
    ]
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  timeLimit: {
    type: Number, // in minutes
    default: 10
  },
  gradeLevel: [{
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }],
  questions: [{
    questionNumber: {
      type: Number,
      required: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'match-pairs'],
      default: 'multiple-choice'
    },
    options: [{
      optionText: String,
      isCorrect: {
        type: Boolean,
        default: false
      },
      explanation: String
    }],
    correctAnswer: {
      type: String, // For fill-blank type
    },
    matchPairs: [{ // For match-pairs type
      left: String,
      right: String
    }],
    points: {
      type: Number,
      default: 1
    },
    timeLimit: Number, // in seconds
    hint: String,
    explanation: String,
    image: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    tags: [String],
    bloomsLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
    }
  }],
  scoring: {
    totalPoints: {
      type: Number,
      default: 0
    },
    passingScore: {
      type: Number,
      default: 60 // percentage
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    allowRetakes: {
      type: Boolean,
      default: true
    },
    maxAttempts: {
      type: Number,
      default: 3
    }
  },
  features: {
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    instantFeedback: {
      type: Boolean,
      default: false
    },
    reviewMode: {
      type: Boolean,
      default: true
    }
  },
  attempts: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    answers: [{
      questionId: mongoose.Schema.ObjectId,
      selectedAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      pointsEarned: Number,
      timeSpent: Number // in seconds
    }],
    score: {
      correct: Number,
      total: Number,
      percentage: Number,
      points: Number
    },
    timeSpent: Number, // total time in seconds
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress'
    },
    feedback: String,
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    completedAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    },
    questionAnalytics: [{
      questionId: mongoose.Schema.ObjectId,
      correctAnswers: {
        type: Number,
        default: 0
      },
      totalAnswers: {
        type: Number,
        default: 0
      },
      averageTimeSpent: {
        type: Number,
        default: 0
      }
    }]
  },
  ecoPointsReward: {
    type: Number,
    default: 15
  },
  bonusPoints: {
    perfectScore: {
      type: Number,
      default: 10
    },
    firstAttempt: {
      type: Number,
      default: 5
    },
    timeBonus: {
      type: Number,
      default: 5
    }
  },
  indianContext: {
    examples: [String],
    culturalReferences: [String],
    localScenarios: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  tags: [String],
  translations: {
    hindi: {
      title: String,
      description: String,
      questions: [{
        questionText: String,
        options: [{
          optionText: String,
          explanation: String
        }],
        hint: String,
        explanation: String
      }]
    },
    bengali: {
      title: String,
      description: String,
      questions: [{
        questionText: String,
        options: [{
          optionText: String,
          explanation: String
        }],
        hint: String,
        explanation: String
      }]
    },
    tamil: {
      title: String,
      description: String,
      questions: [{
        questionText: String,
        options: [{
          optionText: String,
          explanation: String
        }],
        hint: String,
        explanation: String
      }]
    },
    telugu: {
      title: String,
      description: String,
      questions: [{
        questionText: String,
        options: [{
          optionText: String,
          explanation: String
        }],
        hint: String,
        explanation: String
      }]
    },
    marathi: {
      title: String,
      description: String,
      questions: [{
        questionText: String,
        options: [{
          optionText: String,
          explanation: String
        }],
        hint: String,
        explanation: String
      }]
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
QuizSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Calculate total points before saving
QuizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.scoring.totalPoints = this.questions.reduce((total, question) => {
      return total + (question.points || 1);
    }, 0);
  }
  next();
});

// Virtual for completion rate
QuizSchema.virtual('completionRate').get(function() {
  if (this.analytics.totalAttempts === 0) return 0;
  return Math.round((this.analytics.completedAttempts / this.analytics.totalAttempts) * 100);
});

// Virtual for difficulty level numeric
QuizSchema.virtual('difficultyLevel').get(function() {
  const levels = { easy: 1, medium: 2, hard: 3 };
  return levels[this.difficulty] || 1;
});

// Static method to get user's quiz attempts
QuizSchema.statics.getUserAttempts = function(userId, quizId) {
  return this.findById(quizId)
    .select('attempts')
    .populate({
      path: 'attempts',
      match: { user: userId },
      options: { sort: { startedAt: -1 } }
    });
};

// Static method to get popular quizzes
QuizSchema.statics.getPopularQuizzes = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'analytics.totalAttempts': -1, 'analytics.averageScore': -1 })
    .limit(limit)
    .populate('topic', 'title category')
    .populate('author', 'name profile.avatar');
};

// Instance method to start quiz attempt
QuizSchema.methods.startAttempt = function(userId) {
  const userAttempts = this.attempts.filter(attempt => 
    attempt.user.toString() === userId.toString()
  );
  
  const attemptNumber = userAttempts.length + 1;
  
  if (attemptNumber > this.scoring.maxAttempts) {
    throw new Error('Maximum attempts exceeded');
  }
  
  const newAttempt = {
    user: userId,
    attemptNumber,
    startedAt: new Date(),
    status: 'in-progress',
    answers: []
  };
  
  this.attempts.push(newAttempt);
  this.analytics.totalAttempts += 1;
  
  return this.save().then(() => {
    return this.attempts[this.attempts.length - 1];
  });
};

// Instance method to submit answer
QuizSchema.methods.submitAnswer = function(attemptId, questionId, answer) {
  const attempt = this.attempts.id(attemptId);
  if (!attempt) {
    throw new Error('Attempt not found');
  }
  
  const question = this.questions.id(questionId);
  if (!question) {
    throw new Error('Question not found');
  }
  
  // Check if answer is correct
  let isCorrect = false;
  let pointsEarned = 0;
  
  if (question.questionType === 'multiple-choice') {
    const selectedOption = question.options.find(opt => opt._id.toString() === answer.toString());
    isCorrect = selectedOption && selectedOption.isCorrect;
  } else if (question.questionType === 'true-false') {
    isCorrect = answer === question.correctAnswer;
  } else if (question.questionType === 'fill-blank') {
    isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
  }
  
  if (isCorrect) {
    pointsEarned = question.points || 1;
  }
  
  // Add or update answer
  const existingAnswerIndex = attempt.answers.findIndex(ans => 
    ans.questionId.toString() === questionId.toString()
  );
  
  const answerData = {
    questionId,
    selectedAnswer: answer,
    isCorrect,
    pointsEarned,
    timeSpent: 0 // Will be calculated on frontend
  };
  
  if (existingAnswerIndex >= 0) {
    attempt.answers[existingAnswerIndex] = answerData;
  } else {
    attempt.answers.push(answerData);
  }
  
  return this.save();
};

// Instance method to complete quiz attempt
QuizSchema.methods.completeAttempt = function(attemptId, totalTimeSpent) {
  const attempt = this.attempts.id(attemptId);
  if (!attempt) {
    throw new Error('Attempt not found');
  }
  
  attempt.completedAt = new Date();
  attempt.status = 'completed';
  attempt.timeSpent = totalTimeSpent;
  
  // Calculate score
  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
  const totalQuestions = this.questions.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const points = attempt.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
  
  attempt.score = {
    correct: correctAnswers,
    total: totalQuestions,
    percentage,
    points
  };
  
  // Update analytics
  this.analytics.completedAttempts += 1;
  
  // Update average score
  const totalScore = this.analytics.averageScore * (this.analytics.completedAttempts - 1);
  this.analytics.averageScore = (totalScore + percentage) / this.analytics.completedAttempts;
  
  // Update average time
  const totalTime = this.analytics.averageTimeSpent * (this.analytics.completedAttempts - 1);
  this.analytics.averageTimeSpent = (totalTime + totalTimeSpent) / this.analytics.completedAttempts;
  
  return this.save();
};

module.exports = mongoose.model('Quiz', QuizSchema);