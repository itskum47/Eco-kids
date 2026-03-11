const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'School ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Section name is required (e.g., 8-A, 10-B)'],
        trim: true,
        maxlength: [20, 'Section name cannot exceed 20 characters']
    },
    grade: {
        type: Number,
        required: [true, 'Grade level is required'],
        min: [1, 'Grade must be at least 1'],
        max: [12, 'Grade cannot exceed 12']
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    academicYear: {
        type: String,
        required: [true, 'Academic year is required (e.g., 2026-27)'],
        match: [/^\d{4}-\d{2}$/, 'Academic year format: YYYY-YY (e.g., 2026-27)']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Unique section per school per academic year
classSectionSchema.index({ schoolId: 1, name: 1, academicYear: 1 }, { unique: true });
classSectionSchema.index({ teacherId: 1 });
classSectionSchema.index({ students: 1 });
classSectionSchema.index({ schoolId: 1, grade: 1 });

// Get student count virtual
classSectionSchema.virtual('studentCount').get(function () {
    return this.students ? this.students.length : 0;
});

classSectionSchema.set('toJSON', { virtuals: true });
classSectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ClassSection', classSectionSchema);
