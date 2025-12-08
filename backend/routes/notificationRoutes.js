const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Get all notifications
router.get('/', protect, getNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Mark all as read
router.put('/mark-all-read', protect, markAllAsRead);

// Mark single as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;
