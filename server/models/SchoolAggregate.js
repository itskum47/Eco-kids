const mongoose = require('mongoose');

const SchoolAggregateSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        unique: true
    },
    totalEcoPoints: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
    },
    activitiesCompleted: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SchoolAggregate', SchoolAggregateSchema);
