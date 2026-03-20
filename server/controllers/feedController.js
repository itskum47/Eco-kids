const EcoFeedPost = require('../models/EcoFeedPost');
const User = require('../models/User');
const mongoose = require('mongoose');
const Filter = require('bad-words');
const logger = require('../utils/logger');

const filter = new Filter();

const resolveSchoolScope = async (user) => {
  if (user?.profile?.schoolId) return user.profile.schoolId;
  if (user?.schoolId) return user.schoolId;
  if (user?.school && mongoose.Types.ObjectId.isValid(String(user.school))) {
    return user.school;
  }

  if (user?._id) {
    const hydrated = await User.findById(user._id)
      .select('school schoolId schoolCode profile.school profile.schoolId')
      .lean();

    if (hydrated?.profile?.schoolId) return hydrated.profile.schoolId;
    if (hydrated?.schoolId) return hydrated.schoolId;
    if (hydrated?.school && mongoose.Types.ObjectId.isValid(String(hydrated.school))) {
      return hydrated.school;
    }
  }

  return null;
};

/**
 * Feature 1: Cursor-based pagination
 * GET /api/v1/feed/school
 * Query params: cursor=lastPostId, limit=10
 */
exports.getSchoolFeed = async (req, res, next) => {
  try {
    const { cursor, limit = 10 } = req.query;
    const user = req.user;
    const schoolScope = await resolveSchoolScope(user);

    if (!schoolScope) {
      return res.status(400).json({
        success: false,
        message: 'User not assigned to a school'
      });
    }

    const limitNum = Math.min(parseInt(limit), 50); // Max 50 per page

    let query = {
      school: schoolScope,
      isVisible: true
    };

    if (cursor) {
      // Use cursor to find posts with _id < cursor (older posts)
      query._id = { $lt: cursor };
    }

    const posts = await EcoFeedPost.find(query)
      .sort({ _id: -1 })
      .limit(limitNum + 1) // Fetch one extra to determine hasMore
      .populate('author', 'name avatar')
      .lean();

    const hasMore = posts.length > limitNum;
    const returnPosts = hasMore ? posts.slice(0, limitNum) : posts;

    const nextCursor = returnPosts.length > 0
      ? returnPosts[returnPosts.length - 1]._id
      : null;

    res.status(200).json({
      success: true,
      data: returnPosts,
      nextCursor,
      hasMore,
      count: returnPosts.length
    });
  } catch (err) {
    logger.error('[FeedController] Error fetching school feed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: err.message
    });
  }
};

/**
 * Feature 2: Emoji reaction toggle
 * POST /api/v1/feed/:postId/react
 * Body: { emoji: '🌱' | '💧' | '♻️' | '🌍' | '🔥' }
 */
exports.toggleReaction = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    // Validate emoji
    const validEmojis = ['🌱', '💧', '♻️', '🌍', '🔥'];
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emoji. Use one of: 🌱 💧 ♻️ 🌍 🔥'
      });
    }

    const post = await EcoFeedPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Find if user already has any reaction on this post
    let existingReactionEmoji = null;
    for (const reaction of post.reactions) {
      if (reaction.users.includes(userId)) {
        existingReactionEmoji = reaction.emoji;
        break;
      }
    }

    if (existingReactionEmoji === emoji) {
      // User already reacted with this emoji → remove it
      post.reactions = post.reactions.map(r => {
        if (r.emoji === emoji) {
          r.users = r.users.filter(uid => !uid.equals(userId));
          r.count = r.users.length;
        }
        return r;
      }).filter(r => r.count > 0); // Remove reactions with count = 0
    } else {
      // User reacted with different emoji or no emoji → add new reaction, remove old one
      if (existingReactionEmoji) {
        // Remove from previous reaction
        post.reactions = post.reactions.map(r => {
          if (r.emoji === existingReactionEmoji) {
            r.users = r.users.filter(uid => !uid.equals(userId));
            r.count = r.users.length;
          }
          return r;
        }).filter(r => r.count > 0);
      }

      // Add to new reaction
      const existingReaction = post.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
          existingReaction.users.push(userId);
          existingReaction.count = existingReaction.users.length;
        }
      } else {
        post.reactions.push({
          emoji,
          users: [userId],
          count: 1
        });
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Reaction updated',
      data: post.getReactionSummary()
    });
  } catch (err) {
    logger.error('[FeedController] Error toggling reaction:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update reaction',
      error: err.message
    });
  }
};

/**
 * Feature 3 & 4: Create post with real-time broadcasting + profanity filter
 * POST /api/v1/feed/school
 * Body: { caption, activityType, photoUrl, ecoPointsEarned }
 */
exports.createPost = async (req, res, next) => {
  try {
    const { caption, activityType, photoUrl, ecoPointsEarned } = req.body;
    const user = req.user;
    const schoolScope = await resolveSchoolScope(user);

    if (!schoolScope) {
      return res.status(400).json({
        success: false,
        message: 'User not assigned to a school'
      });
    }

    // ─────────────────────────────────────────────────────────
    // Feature 4: Profanity filter on caption
    // ─────────────────────────────────────────────────────────
    if (filter.isProfane(caption)) {
      return res.status(400).json({
        success: false,
        message: 'Caption contains inappropriate language. Please revise.'
      });
    }

    const post = await EcoFeedPost.create({
      author: user._id,
      authorName: user.name,
      authorAvatar: user.avatar || null,
      school: schoolScope,
      activityType: activityType || 'general',
      photoUrl: photoUrl || null,
      caption: caption.trim(),
      ecoPointsEarned: ecoPointsEarned || 0,
      isVisible: true
    });

    const populatedPost = await post.populate('author', 'name avatar');

    // ─────────────────────────────────────────────────────────
    // Feature 3: Real-time post broadcasting via Socket.io
    // ─────────────────────────────────────────────────────────
    if (global.io) {
      global.io.to(`school-${schoolScope}`).emit('new-feed-post', {
        _id: post._id.toString(),
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        activityType: post.activityType,
        photoUrl: post.photoUrl,
        caption: post.caption,
        ecoPointsEarned: post.ecoPointsEarned,
        createdAt: post.createdAt.toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Post created and broadcasted',
      data: populatedPost
    });
  } catch (err) {
    logger.error('[FeedController] Error creating post:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: err.message
    });
  }
};

/**
 * Add comment to post (with profanity filter)
 * POST /api/v1/feed/:postId/comment
 * Body: { text }
 */
exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const user = req.user;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // ─────────────────────────────────────────────────────────
    // Feature 4: Profanity filter on comments
    // ─────────────────────────────────────────────────────────
    if (filter.isProfane(text)) {
      return res.status(400).json({
        success: false,
        message: 'Comment contains inappropriate language. Please revise.'
      });
    }

    const post = await EcoFeedPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar || null,
      text: text.trim()
    });

    await post.save();

    // Broadcast new comment via Socket.io
    if (global.io) {
      global.io.to(`school-${post.school}`).emit('feed-comment-added', {
        postId: post._id.toString(),
        comment: post.comments[post.comments.length - 1]
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: post.comments[post.comments.length - 1]
    });
  } catch (err) {
    logger.error('[FeedController] Error adding comment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: err.message
    });
  }
};

/**
 * Get single post
 * GET /api/v1/feed/:postId
 */
exports.getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await EcoFeedPost.findById(postId)
      .populate('author', 'name avatar')
      .populate('comments.userId', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    logger.error('[FeedController] Error fetching post:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: err.message
    });
  }
};

module.exports = exports;
