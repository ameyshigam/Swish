const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getFriendsList } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/friends', protect, getFriendsList);
router.get('/:userId', protect, getConversation);

module.exports = router;