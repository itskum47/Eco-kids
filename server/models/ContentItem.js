const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['lesson', 'article', 'video', 'guide'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    body: {
        type: String,
        required: [true, 'Content body is required']
    },
    summary: {
        type: String,
        maxlength: 500
    },
    coverImage: {
        type: String,
        default: ''
    },
    gradeLevel: [{
        type: Number,
        min: 1,
        max: 12
    }],
    ncertAlignmentTags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['climate', 'biodiversity', 'water', 'energy', 'waste', 'pollution', 'general'],
        default: 'general',
        index: true
    },
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'pa'],
        index: true
    },
    translations: [{
        language: { type: String, required: true },
        title: String,
        body: String,
        summary: String
    }],
    status: {
        type: String,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedAt: Date,
    readTimeMinutes: {
        type: Number,
        default: 5
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

contentItemSchema.index({ status: 1, type: 1, category: 1 });
contentItemSchema.index({ gradeLevel: 1, status: 1 });
contentItemSchema.index({ ncertAlignmentTags: 1 });

// Auto-generate slug from title
contentItemSchema.pre('validate', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100)
            + '-' + Date.now().toString(36);
    }
    next();
});

// Estimate read time from body length
contentItemSchema.pre('save', function (next) {
    if (this.isModified('body')) {
        const wordCount = this.body.split(/\s+/).length;
        this.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    }
    next();
});

module.exports = mongoose.model('ContentItem', contentItemSchema);
