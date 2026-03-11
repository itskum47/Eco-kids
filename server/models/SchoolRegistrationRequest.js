const mongoose = require('mongoose');

const schoolRegistrationRequestSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: [true, 'School name is required'],
        trim: true,
        maxlength: [200, 'School name cannot exceed 200 characters']
    },
    udiseCode: {
        type: String,
        required: [true, 'UDISE code is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{11}$/.test(v);
            },
            message: 'UDISE code must be exactly 11 digits'
        },
        index: true
    },
    adminName: {
        type: String,
        required: [true, 'Administrator name is required'],
        trim: true
    },
    adminEmail: {
        type: String,
        required: [true, 'Administrator email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    adminPhone: {
        type: String,
        required: [true, 'Administrator phone is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^(\+91)?[6-9]\d{9}$/.test(v);
            },
            message: 'Please provide a valid Indian phone number'
        }
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    schoolType: {
        type: String,
        enum: ['government', 'private', 'aided', 'central'],
        default: 'government'
    },
    studentCount: {
        type: Number,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    createdSchoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        default: null
    },
    createdAdminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

schoolRegistrationRequestSchema.index({ status: 1, createdAt: -1 });
schoolRegistrationRequestSchema.index({ udiseCode: 1 });
schoolRegistrationRequestSchema.index({ adminEmail: 1 });

module.exports = mongoose.model('SchoolRegistrationRequest', schoolRegistrationRequestSchema);
