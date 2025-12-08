const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    updateReportStatus,
    getPendingCount,
    getAllPosts,
    deletePost,
    getAdminStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User can create reports
router.post('/reports', protect, createReport);

// Admin routes
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/reports', protect, adminOnly, getReports);
router.get('/reports/pending-count', protect, adminOnly, getPendingCount);
router.put('/reports/:id', protect, adminOnly, updateReportStatus);
router.get('/posts', protect, adminOnly, getAllPosts);
router.delete('/posts/:id', protect, adminOnly, deletePost);

module.exports = router;
