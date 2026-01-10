const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

// Create a report
const createReport = async (req, res) => {
    try {
        const { type, postId, userId, reason, description } = req.body;

        if (!type || !reason) {
            return res.status(400).json({ message: 'Type and reason are required' });
        }

        const reportData = {
            type, // 'post' or 'user'
            reason, // 'spam', 'harassment', 'inappropriate', 'other'
            description: description || '',
            reporterId: new ObjectId(req.user.id)
        };

        if (type === 'post' && postId) {
            reportData.postId = new ObjectId(postId);
            // Get the post author
            const post = await Post.collection().findOne({ _id: new ObjectId(postId) });
            if (post) {
                reportData.reportedUserId = post.authorId;
            }
        } else if (type === 'user' && userId) {
            reportData.reportedUserId = new ObjectId(userId);
        }

        await Report.create(reportData);
        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all reports (Admin only)
const getReports = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const reports = await Report.findAll(filter);
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update report status (Admin only)
const updateReportStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        await Report.updateStatus(req.params.id, status, adminNotes);
        res.json({ message: 'Report updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get pending report count
const getPendingCount = async (req, res) => {
    try {
        const count = await Report.getPendingCount();
        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Get all posts (for moderation)
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Delete any post
const deletePost = async (req, res) => {
    try {
        await Post.collection().deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Get stats
const getAdminStats = async (req, res) => {
    try {
        const userCount = await User.collection().countDocuments();
        const postCount = await Post.collection().countDocuments();
        const pendingReports = await Report.getPendingCount();
        const totalReports = await Report.collection().countDocuments();

        // Get user breakdown by role
        const roleStats = await User.collection().aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]).toArray();

        res.json({
            users: userCount,
            posts: postCount,
            pendingReports,
            reports: totalReports,
            roleStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Ban/Unban user
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newStatus = !user.isBanned;
        await User.collection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { isBanned: newStatus } }
        );

        res.json({ message: `User ${newStatus ? 'banned' : 'unbanned'}`, isBanned: newStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReport,
    getReports,
    updateReportStatus,
    getPendingCount,
    getAllPosts,
    deletePost,
    getAdminStats,
    banUser
};
