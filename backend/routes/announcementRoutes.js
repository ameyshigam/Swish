const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, adminOnly, adminOrTeacher } = require('../middleware/authMiddleware');

// Cloudinary Config
const { upload } = require('../config/cloudinary');

// Routes
router.post('/', protect, adminOrTeacher, upload.single('file'), createAnnouncement); // Changed field name to 'file' to be generic, or keep 'photo' and allow pdf? user said "add pdf".
router.get('/', protect, getAnnouncements);
router.delete('/:id', protect, adminOrTeacher, deleteAnnouncement);

module.exports = router;
