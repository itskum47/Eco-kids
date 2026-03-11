const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    schoolId: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        index: true
    },
    grade: {
        type: String, // e.g., '5', '6', '7'
        required: true,
        index: true
    },
    section: {
        type: String, // e.g., 'A', 'B'. Optional for schools that don't use sections
        trim: true,
        default: 'A'
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'moduleMode'
    },
    moduleMode: {
        type: String,
        enum: ['Experiment', 'Quiz', 'Topic', 'Game']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    fileUrl: {
        type: String,
        trim: true
    },
    recipients: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'submitted'],
            default: 'pending'
        },
        submittedAt: {
            type: Date
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

AssignmentSchema.index({ schoolId: 1, deadline: 1 });
AssignmentSchema.index({ teacherId: 1 });
AssignmentSchema.index({ grade: 1, schoolId: 1, dueDate: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
