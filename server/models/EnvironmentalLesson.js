const mongoose = require('mongoose');

const EnvironmentalLessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['climate', 'waste', 'water', 'biodiversity', 'energy', 'pollution']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard'],
    default: 'beginner'
  },
  nep2020Competencies: [{
    type: String
  }],
  ncertChapters: [{
    type: String
  }],
  sdgGoals: [{
    type: Number,
    min: 1,
    max: 17
  }],
  prerequisiteTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnvironmentalLesson'
  }],
  ecoPointsReward: {
    type: Number,
    min: [1, 'Eco points must be at least 1'],
    max: [1000, 'Eco points cannot exceed 1000'],
    default: 50
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lesson must have a creator']
  },
  content: {
    type: String,
    required: [true, 'Please provide lesson content'],
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  objectives: [{
    type: String,
    maxlength: [500, 'Each objective cannot exceed 500 characters']
  }],
  tags: [{
    type: String,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  totalCompletions: {
    type: Number,
    default: 0
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

// Index for common queries
EnvironmentalLessonSchema.index({ category: 1, isPublished: 1 });
EnvironmentalLessonSchema.index({ createdBy: 1, isPublished: 1 });
EnvironmentalLessonSchema.index({ difficulty: 1 });

module.exports = mongoose.model('EnvironmentalLesson', EnvironmentalLessonSchema);
