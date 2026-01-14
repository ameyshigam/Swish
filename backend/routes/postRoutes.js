const express = require('express');
const router = express.Router();

const {
    createPost,
    getPosts,
    getUserPosts,
    getExplorePosts,
    toggleLike,
    addComment,
    deletePost,
    getPostById,
    toggleBookmark,
    getBookmarkedPosts
} = require('../controllers/postController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Cloudinary Config
const { upload } = require('../config/cloudinary');

// Use Cloudinary upload middleware
// Validates file types via Cloudinary config or additional middleware if needed

// Static routes first
router.post('/', protect, upload.single('image'), createPost);
router.get('/', protect, getPosts);
router.get('/explore', protect, getExplorePosts);
router.get('/me', protect, getUserPosts);
router.get('/bookmarks', protect, getBookmarkedPosts);

// Dynamic routes after
router.get('/:id', protect, getPostById);
router.put('/:id/like', protect, toggleLike);
router.put('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;

