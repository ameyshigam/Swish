const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createStory, getStories, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'story-' + req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|mp4|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images or Videos Only!');
        }
    }
});

router.post('/', protect, upload.single('media'), createStory);
router.get('/', protect, getStories);
router.delete('/:id', protect, deleteStory);

module.exports = router;