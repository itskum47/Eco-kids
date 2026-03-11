const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a topic title'],
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
  content: {
    type: String,
    required: [true, 'Please provide content']
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
      'forest-conservation',
      'ocean-health',
      'sustainable-living'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  gradeLevel: [{
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }],
  indianContext: {
    regions: [{
      type: String,
      enum: ['north', 'south', 'east', 'west', 'central', 'northeast']
    }],
    examples: [{
      title: String,
      description: String,
      location: String,
      imageUrl: String
    }],
    relevantLaws: [{
      name: String,
      description: String,
      year: Number
    }]
  },
  multimedia: {
    featuredImage: {
      url: String,
      alt: String
    },
    images: [{
      url: String,
      alt: String,
      caption: String
    }],
    videos: [{
      url: String,
      title: String,
      duration: Number,
      thumbnail: String
    }],
    infographics: [{
      url: String,
      title: String,
      description: String
    }]
  },
  interactiveElements: {
    polls: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }],
    factBoxes: [{
      title: String,
      content: String,
      type: {
        type: String,
        enum: ['fact', 'tip', 'warning', 'activity']
      }
    }],
    glossary: [{
      term: String,
      definition: String
    }]
  },
  relatedTopics: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Topic'
  }],
  prerequisites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Topic'
  }],
  learningObjectives: [String],
  keyTakeaways: [String],
  tags: [String],
  readingTime: {
    type: Number, // in minutes
    default: 5
  },
  ecoPointsReward: {
    type: Number,
    default: 10
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
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  translations: {
    hindi: {
      title: String,
      description: String,
      content: String,
      keyTakeaways: [String]
    },
    bengali: {
      title: String,
      description: String,
      content: String,
      keyTakeaways: [String]
    },
    tamil: {
      title: String,
      description: String,
      content: String,
      keyTakeaways: [String]
    },
    telugu: {
      title: String,
      description: String,
      content: String,
      keyTakeaways: [String]
    },
    marathi: {
      title: String,
      description: String,
      content: String,
      keyTakeaways: [String]
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
TopicSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Calculate reading time based on content length
TopicSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Virtual for engagement rate
TopicSchema.virtual('engagementRate').get(function() {
  if (this.views === 0) return 0;
  return Math.round(((this.likes + this.completions) / this.views) * 100);
});

// Static method to get popular topics
TopicSchema.statics.getPopularTopics = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('author', 'name profile.avatar');
};

// Static method to get topics by category
TopicSchema.statics.getTopicsByCategory = function(category, limit = 10) {
  return this.find({ category, status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name profile.avatar');
};

// Instance method to increment views
TopicSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to add like
TopicSchema.methods.addLike = function() {
  this.likes += 1;
  return this.save();
};

// Instance method to mark completion
TopicSchema.methods.markCompletion = function() {
  this.completions += 1;
  return this.save();
};

module.exports = mongoose.model('Topic', TopicSchema);