const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, adminOnly, adminOrTeacher } = require('../middleware/authMiddleware');

// Multer config
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
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased limit for PDFs
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images or PDFs Only!'));
        }
    }
});

// Routes
router.post('/', protect, adminOrTeacher, upload.single('file'), createAnnouncement); // Changed field name to 'file' to be generic, or keep 'photo' and allow pdf? user said "add pdf".
router.get('/', protect, getAnnouncements);
router.delete('/:id', protect, adminOrTeacher, deleteAnnouncement);

module.exports = router;
