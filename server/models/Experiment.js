const mongoose = require('mongoose');

const ExperimentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an experiment title'],
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
  objective: {
    type: String,
    required: [true, 'Please provide experiment objective']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: {
      values: [
        'tree-planting',
        'waste-segregation',
        'waste-recycling',
        'water-saving',
        'energy-saving',
        'composting',
        'pollution-control',
        'renewable-energy-experiment',
        'biodiversity-survey',
        'air-quality-monitoring',
        'soil-analysis',
        'environmental-lesson',
        'environmental-awareness',
        'environmental-science',
        'habit-tracker'
      ],
      message: 'Category "{VALUE}" is not a valid category. Must be one of the defined impact-mapped categories.'
    },
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  estimatedTime: {
    type: Number, // in minutes
    required: [true, 'Please provide estimated time']
  },
  gradeLevel: [{
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }],
  materials: [{
    name: {
      type: String,
      required: true
    },
    quantity: String,
    whereToFind: String,
    alternatives: [String],
    cost: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    essential: {
      type: Boolean,
      default: true
    }
  }],
  safety: {
    required: {
      type: Boolean,
      default: false
    },
    adultSupervision: {
      type: Boolean,
      default: false
    },
    warnings: [String],
    protectiveGear: [String],
    firstAid: [String]
  },
  procedure: [{
    stepNumber: {
      type: Number,
      required: true
    },
    title: String,
    instruction: {
      type: String,
      required: true
    },
    image: String,
    video: String,
    tips: [String],
    timeEstimate: Number, // in minutes
    safetyNote: String
  }],
  expectedResults: {
    description: String,
    images: [String],
    variations: [{
      condition: String,
      result: String
    }]
  },
  scientificExplanation: {
    phenomenon: String,
    theory: String,
    realWorldApplications: [String],
    furtherReading: [String]
  },
  indianContext: {
    localRelevance: String,
    regionalVariations: [String],
    culturalConnections: [String],
    environmentalImpact: String
  },
  extensions: [{
    title: String,
    description: String,
    materials: [String],
    procedure: [String]
  }],
  assessment: {
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'short-answer', 'observation']
      },
      options: [String], // for multiple choice
      correctAnswer: String,
      explanation: String
    }],
    observations: [{
      prompt: String,
      type: {
        type: String,
        enum: ['text', 'image', 'measurement', 'drawing']
      }
    }]
  },
  submissions: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    photos: [String],
    observations: [{
      question: String,
      answer: mongoose.Schema.Types.Mixed
    }],
    results: String,
    learnings: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'approved', 'needs-revision'],
      default: 'submitted'
    },
    teacherFeedback: String,
    points: Number
  }],
  multimedia: {
    featuredImage: String,
    instructionImages: [String],
    demoVideo: String,
    resultPhotos: [String]
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  ecoPointsReward: {
    type: Number,
    default: 25
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
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
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  tags: [String],
  relatedTopics: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Topic'
  }],
  relatedExperiments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Experiment'
  }],
  translations: {
    hindi: {
      title: String,
      description: String,
      objective: String,
      procedure: [{
        title: String,
        instruction: String,
        tips: [String]
      }]
    },
    bengali: {
      title: String,
      description: String,
      objective: String,
      procedure: [{
        title: String,
        instruction: String,
        tips: [String]
      }]
    },
    tamil: {
      title: String,
      description: String,
      objective: String,
      procedure: [{
        title: String,
        instruction: String,
        tips: [String]
      }]
    },
    telugu: {
      title: String,
      description: String,
      objective: String,
      procedure: [{
        title: String,
        instruction: String,
        tips: [String]
      }]
    },
    marathi: {
      title: String,
      description: String,
      objective: String,
      procedure: [{
        title: String,
        instruction: String,
        tips: [String]
      }]
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
ExperimentSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Virtual for completion rate
ExperimentSchema.virtual('completionRate').get(function() {
  if (this.metrics.attempts === 0) return 0;
  return Math.round((this.metrics.completions / this.metrics.attempts) * 100);
});

// Virtual for difficulty level numeric
ExperimentSchema.virtual('difficultyLevel').get(function() {
  const levels = { easy: 1, medium: 2, hard: 3 };
  return levels[this.difficulty] || 1;
});

// Virtual for total cost estimate
ExperimentSchema.virtual('totalCost').get(function() {
  let minTotal = 0;
  let maxTotal = 0;
  
  this.materials.forEach(material => {
    if (material.cost) {
      minTotal += material.cost.min || 0;
      maxTotal += material.cost.max || material.cost.min || 0;
    }
  });
  
  return { min: minTotal, max: maxTotal };
});

// Static method to get popular experiments
ExperimentSchema.statics.getPopularExperiments = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'metrics.attempts': -1, 'metrics.averageRating': -1 })
    .limit(limit)
    .populate('author', 'name profile.avatar');
};

// Static method to get experiments by category
ExperimentSchema.statics.getExperimentsByCategory = function(category, limit = 10) {
  return this.find({ category, status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name profile.avatar');
};

// Instance method to increment views
ExperimentSchema.methods.incrementViews = function() {
  this.metrics.views += 1;
  return this.save();
};

// Instance method to record attempt
ExperimentSchema.methods.recordAttempt = function() {
  this.metrics.attempts += 1;
  return this.save();
};

// Instance method to record completion
ExperimentSchema.methods.recordCompletion = function() {
  this.metrics.completions += 1;
  return this.save();
};

// Instance method to add rating
ExperimentSchema.methods.addRating = function(rating) {
  const currentTotal = this.metrics.averageRating * this.metrics.ratingCount;
  this.metrics.ratingCount += 1;
  this.metrics.averageRating = (currentTotal + rating) / this.metrics.ratingCount;
  return this.save();
};

// Instance method to submit experiment result
ExperimentSchema.methods.submitResult = function(userId, submissionData) {
  this.submissions.push({
    user: userId,
    ...submissionData,
    submittedAt: new Date()
  });

  this.metrics.completions += 1;
  return this.save();
};

module.exports = mongoose.model('Experiment', ExperimentSchema);