const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { protect } = require('../middleware/auth');
const { moderateTextFields } = require('../middleware/contentModeration');

// All feed routes require authentication
router.use(protect);

// Get school feed with cursor-based pagination
router.get('/school', feedController.getSchoolFeed);

// Get single post
router.get('/:postId', feedController.getPost);

// Create new post (with real-time broadcasting + profanity filter)
router.post('/school', moderateTextFields(['caption']), feedController.createPost);

// Add comment to post (with profanity filter)
router.post('/:postId/comment', moderateTextFields(['text']), feedController.addComment);

// Toggle emoji reaction on post
router.post('/:postId/react', feedController.toggleReaction);

// Legacy endpoint (for backward compatibility)
router.get("/feed", async (req, res) => {
    const ActivityFeed = require('../models/ActivityFeed');
    try {
        const feed = await ActivityFeed
            .find()
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(feed);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
