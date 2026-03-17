const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  activityType: {
    type: String,
    trim: true,
    default: ''
  },
  grade: {
    type: String,
    trim: true,
    default: ''
  },
  dueDate: {
    type: Date
  },
  ecoPoints: {
    type: Number,
    min: 0,
    default: 10
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  }
}, {
  _id: true,
  timestamps: true
});

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true,
    default: null
  },
  schoolCode: {
    type: String,
    trim: true,
    default: '',
    index: true
  },
  classes: [{
    type: String,
    trim: true
  }],
  subjects: [{
    type: String,
    trim: true
  }],
  assignments: [assignmentSchema]
}, {
  timestamps: true
});

teacherSchema.index({ schoolId: 1, classes: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);