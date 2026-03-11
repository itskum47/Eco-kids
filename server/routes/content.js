const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ContentItem = require('../models/ContentItem');
const asyncHandler = require('../middleware/async');

// @desc    Get published content (public) or all content (admin)
// @route   GET /api/content
// @access  Public/Admin
router.get('/', asyncHandler(async (req, res) => {
    const { status, search, category, grade, type, language, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Public users only see published content
    if (!req.user || !['admin', 'teacher', 'school_admin'].includes(req.user?.role)) {
        filter.status = 'published';
    } else if (status) {
        filter.status = status;
    }

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (language) filter.language = language;
    if (grade) filter.gradeLevel = parseInt(grade);
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
            { ncertAlignmentTags: { $regex: search, $options: 'i' } }
        ];
    }

    const items = await ContentItem.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('createdBy', 'name')
        .lean();

    const total = await ContentItem.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: items
    });
}));

// @desc    Create content item
// @route   POST /api/content
// @access  Private/Admin,Teacher
router.post('/', protect, authorize('admin', 'teacher', 'school_admin'), asyncHandler(async (req, res) => {
    const item = await ContentItem.create({
        ...req.body,
        createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: item });
}));

// @desc    Update content item
// @route   PUT /api/content/:id
// @access  Private/Admin,Teacher (owner)
router.put('/:id', protect, authorize('admin', 'teacher', 'school_admin'), asyncHandler(async (req, res) => {
    const item = await ContentItem.findById(req.params.id);
    if (!item) {
        return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // If publishing, set publishedAt
    if (req.body.status === 'published' && item.status !== 'published') {
        req.body.publishedAt = new Date();
        req.body.reviewedBy = req.user._id;
    }

    const updated = await ContentItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    });

    res.status(200).json({ success: true, data: updated });
}));

// @desc    Delete content item
// @route   DELETE /api/content/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const item = await ContentItem.findById(req.params.id);
    if (!item) {
        return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Content deleted' });
}));

module.exports = router;
