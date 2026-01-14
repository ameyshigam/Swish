const express = require('express');
const router = express.Router();
const { createStory, getStories, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');

// Cloudinary Config
const { upload } = require('../config/cloudinary');

router.post('/', protect, upload.single('media'), createStory);
router.get('/', protect, getStories);
router.delete('/:id', protect, deleteStory);

module.exports = router;