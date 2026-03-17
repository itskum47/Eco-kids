const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a school name'],
        trim: true,
        index: true
    },
    district: {
        type: String,
        required: [true, 'Please provide a district'],
        trim: true,
        index: true
    },
    state: {
        type: String,
        required: [true, 'Please provide a state'],
        default: 'Punjab',
        trim: true,
        index: true
    },
    code: {
        type: String,
        unique: true,
        required: [true, 'Please provide a unique government school code (UDISE)'],
        trim: true,
        index: true
    },
    schoolCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        index: true
    },
    board: {
        type: String,
        trim: true,
        default: ''
    },
    schoolType: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    pincode: {
        type: String,
        trim: true,
        default: ''
    },
    principalName: {
        type: String,
        trim: true,
        default: ''
    },
    principalPhone: {
        type: String,
        trim: true,
        default: ''
    },
    udiseCode: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        match: [/^\d{11}$/, 'UDISE code must be exactly 11 digits'],
        index: true
    },
    udiseVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    udiseVerifiedAt: {
        type: Date
    },
    udiseVerificationSource: {
        type: String,
        enum: ['udise_api', 'local_registry', 'manual_review'],
        default: 'local_registry'
    },
    schoolCategory: {
        type: String,
        trim: true,
        default: ''
    },
    managementType: {
        type: String,
        trim: true,
        default: ''
    },
    addressLine: {
        type: String,
        trim: true,
        default: ''
    },
    principalContact: {
        name: String,
        email: String,
        phone: String
    },
    public_leaderboard_enabled: {
        type: Boolean,
        default: true,
        index: true
    },
    max_sensitivity_level: {
        type: String,
        enum: ['standard', 'sensitive', 'distressing'],
        default: 'distressing'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Keep legacy `code` and new `udiseCode` in sync for backward compatibility.
SchoolSchema.pre('validate', function(next) {
    if (!this.udiseCode && this.code && /^\d{11}$/.test(this.code)) {
        this.udiseCode = this.code;
    }

    if (!this.code && this.udiseCode) {
        this.code = this.udiseCode;
    }

    if (!this.schoolCode && this.code) {
        this.schoolCode = this.code;
    }

    if (!this.code && this.schoolCode) {
        this.code = this.schoolCode;
    }

    next();
});

module.exports = mongoose.model('School', SchoolSchema);
