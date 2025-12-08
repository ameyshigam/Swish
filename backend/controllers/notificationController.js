const Notification = require('../models/Notification');

// Get user's notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getByUser(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
    try {
        await Notification.markAsRead(req.params.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
