const express = require('express');
const router = express.Router();

const {
    getUserProfile,
    updateProfile,
    updateAvatar,
    toggleFollow,
    getFollowers,
    getFollowing,
    searchUsers,
    getSuggestedUsers,
    getUserPosts,
    respondToFollowRequest,
    getFollowRequests
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Cloudinary config
const { upload } = require('../config/cloudinary');

// Using Cloudinary upload middleware, file size limits and filters can be configured in cloudinary.js or here if using a custom wrapper, 
// but for standard implementation, we import the pre-configured upload instance.

// Search users - must be before /:id routes
router.get('/search', protect, searchUsers);

// Suggested users to follow
router.get('/suggested', protect, getSuggestedUsers);

// Update own profile - must be before /:id routes
router.put('/profile', protect, updateProfile);

// Update avatar - must be before /:id routes
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

// Get user profile - dynamic routes must come AFTER static routes
router.get('/:id', protect, getUserProfile);

// Get user's posts
router.get('/:id/posts', protect, getUserPosts);

// Follow/Unfollow
router.put('/:id/follow', protect, toggleFollow);

// Respond to follow request
router.post('/requests/respond', protect, respondToFollowRequest);

// Get follow requests
router.get('/requests/pending', protect, getFollowRequests);

// Get followers
router.get('/:id/followers', protect, getFollowers);

// Get following
router.get('/:id/following', protect, getFollowing);

module.exports = router;
