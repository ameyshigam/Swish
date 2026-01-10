const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

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

