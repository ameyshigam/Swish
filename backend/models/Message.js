const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Message {
    static collection() {
        return getDB().collection('messages');
    }

    static async create(messageData) {
        return await this.collection().insertOne({
            ...messageData,
            read: false,
            createdAt: new Date()
        });
    }

    static async getConversation(userId1, userId2, limit = 50) {
        return await this.collection().find({
            $or: [
                { senderId: new ObjectId(userId1), recipientId: new ObjectId(userId2) },
                { senderId: new ObjectId(userId2), recipientId: new ObjectId(userId1) }
            ]
        })
        .sort({ createdAt: 1 }) // Chronological order
        .limit(limit)
        .toArray();
    }
    
    static async markAsRead(senderId, recipientId) {
        return await this.collection().updateMany(
            { senderId: new ObjectId(senderId), recipientId: new ObjectId(recipientId), read: false },
            { $set: { read: true } }
        );
    }
}

module.exports = Message;