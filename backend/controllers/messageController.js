const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { ObjectId } = require('mongodb');

const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        
        if (!content || !recipientId) {
            return res.status(400).json({ message: 'Recipient and content required' });
        }
        
        const sender = await User.findById(req.user.id);
        const isFollowing = sender.following?.some(id => id.toString() === recipientId);
        
        if (!isFollowing) {
             return res.status(403).json({ message: 'You can only message friends you follow' });
        }
        
        await Message.create({
            senderId: new ObjectId(req.user.id),
            recipientId: new ObjectId(recipientId),
            content
        });
        
        // Notification logic removed as per user request
        // await Notification.createMessageNotification(req.user.id, recipientId, content);
        
        res.status(201).json({ message: 'Message sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.getConversation(req.user.id, userId);
        
        // Mark as read
        await Message.markAsRead(userId, req.user.id);
        
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getFriendsList = async (req, res) => {
    try {
        const friends = await User.getFollowing(req.user.id);
        res.json(friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { sendMessage, getConversation, getFriendsList };