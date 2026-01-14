const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { ObjectId } = require('mongodb');

const createPost = async (req, res) => {
    try {
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        if (!caption || caption.trim().length === 0) {
            return res.status(400).json({ message: 'Caption is required' });
        }

        if (caption.length > 500) {
            return res.status(400).json({ message: 'Caption must be less than 500 characters' });
        }

        const newPost = {
            authorId: new ObjectId(req.user.id),
            caption: caption.trim(),
            imageUrl: req.file.path,
            likes: [],
            comments: []
        };

        const result = await Post.create(newPost);
        res.status(201).json({ message: 'Post created', postId: result.insertedId, post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get current user to access following list
        const user = await User.findById(req.user.id);

        // If user not found (rare case if auth passed), return empty or handle error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followingIds = user.following || [];

        // Ensure all IDs are ObjectIds
        const formattedFollowingIds = followingIds
            .filter(id => ObjectId.isValid(id))
            .map(id => new ObjectId(id));

        // Use findFeed instead of findAllPaginated
        const posts = await Post.findFeed(formattedFollowingIds, req.user.id, skip, limit);
        const total = await Post.getFeedCount(formattedFollowingIds, req.user.id);

        res.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: skip + posts.length < total
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.findByAuthor(req.user.id);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getExplorePosts = async (req, res) => {
    try {
        const posts = await Post.findExplore();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const searchPosts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const posts = await Post.searchPosts(q);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const result = await Post.like(postId, req.user.id);

        // Send notification if liked (not unliked)
        if (result.liked) {
            const post = await Post.collection().findOne({ _id: new ObjectId(postId) });
            if (post && post.authorId.toString() !== req.user.id) {
                await Notification.createLikeNotification(
                    req.user.id,
                    post.authorId.toString(),
                    postId
                );
            }
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        if (text.length > 280) {
            return res.status(400).json({ message: 'Comment must be less than 280 characters' });
        }

        let username = req.user.username;
        let userAvatar = req.user.profileData?.avatarUrl || '';

        if (!username) {
            const user = await User.findById(req.user.id);
            if (user) {
                username = user.username;
                userAvatar = user.profileData?.avatarUrl || '';
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        const comment = await Post.addComment(postId, req.user.id, text.trim(), username, userAvatar);

        // Send notification to post author
        const post = await Post.collection().findOne({ _id: new ObjectId(postId) });
        if (post && post.authorId.toString() !== req.user.id) {
            await Notification.createCommentNotification(
                req.user.id,
                post.authorId.toString(),
                postId,
                text
            );
        }

        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.collection().findOne({ _id: new ObjectId(req.params.id) });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is author or admin
        if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Post.collection().deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findByIdWithAuthor(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Bookmark a post
const toggleBookmark = async (req, res) => {
    try {
        const postId = req.params.id;
        const result = await User.toggleBookmark(req.user.id, postId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get user's bookmarked posts
const getBookmarkedPosts = async (req, res) => {
    try {
        const bookmarks = await User.getBookmarks(req.user.id);

        if (bookmarks.length === 0) {
            return res.json([]);
        }

        const posts = await Post.findBookmarksWithAuthor(bookmarks);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createPost,
    getPosts,
    getUserPosts,
    getExplorePosts,
    toggleLike,
    addComment,
    deletePost,
    getPostById,
    toggleBookmark,
    getBookmarkedPosts,
    searchPosts
};
