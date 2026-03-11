import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { feedAPI } from '../utils/api';

const EcoFeedPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const observerRef = useRef();
  const lastPostRef = useRef();

  // Load initial feed
  const loadFeed = async () => {
    try {
      setIsLoadingFeed(true);
      setError('');
      const response = await feedAPI.getSchoolFeed();
      const data = response.data;
      setPosts(data.data || []);
      setNextCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load Eco-Feed');
      console.error('[EcoFeedPage] Error loading feed:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    try {
      setIsLoadingMore(true);
      const response = await feedAPI.getSchoolFeed(nextCursor);
      const data = response.data;
      setPosts((prev) => [...prev, ...(data.data || [])]);
      setNextCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('[EcoFeedPage] Error loading more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    if (isLoadingFeed || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;
    if (lastPostRef.current) {
      observer.observe(lastPostRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingFeed, loadMore, isLoadingMore]);

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    const text = newPostText.trim();

    if (!text) {
      toast.error('Post cannot be empty');
      return;
    }

    try {
      setIsPosting(true);
      const response = await feedAPI.createPost({ text });
      const newPost = response.data.data;

      // Optimistic update: prepend new post
      setPosts((prev) => [newPost, ...prev]);
      setNewPostText('');
      toast.success('Post shared! 🌱');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create post';
      toast.error(message);
    } finally {
      setIsPosting(false);
    }
  };

  // Toggle reaction
  const handleToggleReaction = async (postId, emoji) => {
    try {
      await feedAPI.toggleReaction(postId, { emoji });

      // Update local state optimistically
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const reactions = [...(post.reactions || [])];
            const existingReactionIndex = reactions.findIndex((r) =>
              r.users.some((uid) => uid === user._id || uid._id === user._id)
            );

            let updatedReactions = reactions;

            if (existingReactionIndex >= 0) {
              const existingReaction = reactions[existingReactionIndex];
              if (existingReaction.emoji === emoji) {
                // Remove user from this reaction
                existingReaction.users = existingReaction.users.filter(
                  (uid) => (typeof uid === 'string' ? uid : uid._id) !== user._id
                );
                existingReaction.count = existingReaction.users.length;
                if (existingReaction.count === 0) {
                  updatedReactions = reactions.filter((r) => r.emoji !== emoji);
                }
              } else {
                // Remove from old, add to new
                existingReaction.users = existingReaction.users.filter(
                  (uid) => (typeof uid === 'string' ? uid : uid._id) !== user._id
                );
                existingReaction.count = existingReaction.users.length;
                if (existingReaction.count === 0) {
                  updatedReactions = reactions.filter((r) => r.emoji !== existingReaction.emoji);
                }

                const targetReactionIndex = updatedReactions.findIndex((r) => r.emoji === emoji);
                if (targetReactionIndex >= 0) {
                  updatedReactions[targetReactionIndex].users.push(user._id);
                  updatedReactions[targetReactionIndex].count += 1;
                } else {
                  updatedReactions.push({ emoji, users: [user._id], count: 1 });
                }
              }
            } else {
              // Add new reaction
              const targetReactionIndex = reactions.findIndex((r) => r.emoji === emoji);
              if (targetReactionIndex >= 0) {
                reactions[targetReactionIndex].users.push(user._id);
                reactions[targetReactionIndex].count += 1;
              } else {
                updatedReactions.push({ emoji, users: [user._id], count: 1 });
              }
            }

            return { ...post, reactions: updatedReactions };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('[EcoFeedPage] Error toggling reaction:', err);
      toast.error('Failed to react');
    }
  };

  // Add comment
  const handleAddComment = async (postId, text) => {
    if (!text.trim()) return;

    try {
      const response = await feedAPI.addComment(postId, { text: text.trim() });
      const newComment = response.data.data;

      // Update local state
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), newComment]
            };
          }
          return post;
        })
      );

      toast.success('Comment added');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add comment';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Eco-Feed</h1>
          <p className="text-gray-600 mt-1">
            Share your eco-actions and connect with your school community! 🌍
          </p>
        </div>

        {/* Create Post Form */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm"
        >
          <form onSubmit={handleCreatePost}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Share your eco-journey... 🌱"
                  rows={3}
                  maxLength={500}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{newPostText.length}/500</span>
                  <button
                    type="submit"
                    disabled={isPosting || !newPostText.trim()}
                    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Loading State */}
        {isLoadingFeed && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
            Loading feed...
          </div>
        )}

        {/* Error State */}
        {!isLoadingFeed && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
            <div className="font-semibold">Could not load feed</div>
            <div className="text-sm mt-1">{error}</div>
            <button
              onClick={loadFeed}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingFeed && !error && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-200 p-10 text-center"
          >
            <p className="text-5xl mb-4">🌱</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 text-sm">Be the first to share your eco-journey!</p>
          </motion.div>
        )}

        {/* Posts Feed */}
        {!isLoadingFeed && !error && posts.length > 0 && (
          <div className="space-y-5">
            <AnimatePresence>
              {posts.map((post, index) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onToggleReaction={handleToggleReaction}
                  onAddComment={handleAddComment}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More Indicator */}
        {isLoadingMore && (
          <div className="text-center py-4 text-gray-600 text-sm">Loading more posts...</div>
        )}

        {/* End of Feed */}
        {!isLoadingFeed && !hasMore && posts.length > 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            You're all caught up! 🌍
          </div>
        )}
      </div>
    </div>
  );
};

// PostCard Component
const PostCard = React.forwardRef(({ post, currentUser, onToggleReaction, onAddComment }, ref) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const validEmojis = ['🌱', '💧', '♻️', '🌍', '🔥'];

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setIsCommenting(true);
    await onAddComment(post._id, commentText);
    setCommentText('');
    setIsCommenting(false);
  };

  const userReaction = post.reactions?.find((r) =>
    r.users.some((uid) => (typeof uid === 'string' ? uid : uid._id) === currentUser?._id)
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
    >
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
          {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{post.author?.name || 'Anonymous'}</div>
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-gray-800 mb-4 whitespace-pre-wrap">{post.text}</div>

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {validEmojis.map((emoji) => {
          const reaction = post.reactions?.find((r) => r.emoji === emoji);
          const isActive = userReaction?.emoji === emoji;

          return (
            <button
              key={emoji}
              onClick={() => onToggleReaction(post._id, emoji)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                isActive
                  ? 'bg-green-100 border-green-400'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg mr-1">{emoji}</span>
              {reaction && reaction.count > 0 && (
                <span className="text-xs font-semibold text-gray-700">{reaction.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-gray-600 hover:text-gray-900 font-medium mb-2"
      >
        {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-2 pl-3 border-l-2 border-gray-200">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold text-gray-900">{comment.userName}</span>
                  <span className="text-gray-700 ml-2">{comment.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCommenting) {
                  handleSubmitComment();
                }
              }}
              placeholder="Add a comment..."
              maxLength={300}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleSubmitComment}
              disabled={isCommenting || !commentText.trim()}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isCommenting ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
});

PostCard.displayName = 'PostCard';

export default EcoFeedPage;
