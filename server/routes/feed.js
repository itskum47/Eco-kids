const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/v1/feed (requires auth)
// Get eco-feed with pagination
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const Feed = require('../models/Feed');

    const posts = await Feed.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feed.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching feed', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// POST /api/v1/feed (requires auth)
// Create a new post
router.post('/', protect, async (req, res) => {
  try {
    const { content, imageUrl, category } = req.body;
    const userId = req.user.id;

    const Feed = require('../models/Feed');

    const post = await Feed.create({
      userId,
      content,
      imageUrl,
      category,
    });

    const populated = await post.populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      post: populated,
    });
  } catch (error) {
    logger.error('Error creating feed post', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/v1/feed/:postId
// Get single post with comments
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const Feed = require('../models/Feed');

    const post = await Feed.findById(postId)
      .populate('userId', 'firstName lastName email')
      .populate('comments.userId', 'firstName lastName email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('Error fetching feed post', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/v1/feed/:postId/like (requires auth)
// Like a post
router.post('/:postId/like', protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const Feed = require('../models/Feed');

    const post = await Feed.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.likes) post.likes = [];
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter(id => !id.equals(userId));
    }

    await post.save();
    res.json({
      success: true,
      likes: post.likes.length,
    });
  } catch (error) {
    logger.error('Error liking post', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// POST /api/v1/feed/:postId/comment (requires auth)
// Add comment to post
router.post('/:postId/comment', protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const User = require('../models/User');
    const Feed = require('../models/Feed');

    const post = await Feed.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = await User.findById(userId);

    if (!post.comments) post.comments = [];
    post.comments.push({
      userId,
      text,
      createdAt: new Date(),
    });

    await post.save();

    res.json({
      success: true,
      comment: {
        userId: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        text,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error adding comment', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// DELETE /api/v1/feed/:postId (requires auth)
// Delete own post
router.delete('/:postId', protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const Feed = require('../models/Feed');

    const post = await Feed.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.userId.equals(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Feed.findByIdAndDelete(postId);
    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    logger.error('Error deleting post', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
