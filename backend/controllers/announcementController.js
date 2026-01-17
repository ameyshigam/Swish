const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');

// Create announcement
const createAnnouncement = async (req, res) => {
    try {
        const { priority, subject, description, category, targetSection } = req.body;
        const userRole = req.user.role;

        // Role-based validation
        if (userRole === 'Faculty') {
            if (category !== 'Exam Notifications' && category !== 'Latest announcements') {
                return res.status(403).json({ message: 'Faculty can only add Exam Notifications or Latest Announcements' });
            }
        }

        // Admin specific validation (optional, but good for structure)
        if (userRole === 'Admin' && category === 'Scholarship Section' && !targetSection) {
            // Requirement says "admin can sent scholarship notices in 4 diff section". 
            // We can enforce targetSection here if strictly needed, or just allow it.
            // Let's allow it to be optional but recommended.
        }

        let photoPath = null;
        let filePath = null;

        if (req.file) {
            console.log('Upload metadata:', req.file);
            const fileUrl = req.file.path;
            if (req.file.mimetype === 'application/pdf') {
                filePath = fileUrl;
            } else {
                photoPath = fileUrl;
            }
        }

        const announcement = await Announcement.create({
            priority,
            subject,
            description,
            category,
            targetSection,
            photo: photoPath,
            fileUrl: filePath,
            createdBy: req.user ? req.user.id : null
        });

        // Notify Students
        // Find all students
        const students = await User.findAllStudents();

        // Create notifications for each student
        const notifications = students.map(student => ({
            type: 'announcement',
            recipientId: student._id,
            announcementId: announcement._id,
            message: `New Announcement: ${subject}`
        }));

        if (notifications.length > 0) {
            await Notification.createBulk(notifications);
        }

        res.status(201).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const category = req.query.category || null;
        const items = await Announcement.getAll({ category, limit: 100 });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Announcement.delete(id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement };
