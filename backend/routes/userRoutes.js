const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getUserProfile,
    updateProfile,
    updateAvatar,
    toggleFollow,
    getFollowers,
    getFollowing,
    searchUsers,
    getSuggestedUsers,
    getUserPosts
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Multer config for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar-' + req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB limit for avatars
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

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

// Get followers
router.get('/:id/followers', protect, getFollowers);

// Get following
router.get('/:id/following', protect, getFollowing);

module.exports = router;
