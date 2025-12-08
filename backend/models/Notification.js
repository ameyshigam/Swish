const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Notification {
    static collection() {
        return getDB().collection('notifications');
    }

    static async create(notificationData) {
        const result = await this.collection().insertOne({
            ...notificationData,
            read: false,
            createdAt: new Date(),
        });
        return result;
    }

    static async getByUser(userId, limit = 20) {
        return await this.collection().aggregate([
            { $match: { recipientId: new ObjectId(userId) } },
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'senderId',
                    foreignField: '_id',
                    as: 'sender'
                }
            },
            {
                $unwind: {
                    path: '$sender',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'sender.password': 0,
                    'sender.email': 0
                }
            }
        ]).toArray();
    }

    static async markAsRead(notificationId) {
        return await this.collection().updateOne(
            { _id: new ObjectId(notificationId) },
            { $set: { read: true } }
        );
    }

    static async markAllAsRead(userId) {
        return await this.collection().updateMany(
            { recipientId: new ObjectId(userId), read: false },
            { $set: { read: true } }
        );
    }

    static async getUnreadCount(userId) {
        return await this.collection().countDocuments({
            recipientId: new ObjectId(userId),
            read: false
        });
    }

    static async deleteOld(days = 30) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        return await this.collection().deleteMany({
            createdAt: { $lt: dateThreshold }
        });
    }

    // Notification types: 'like', 'comment', 'follow'
    static async createLikeNotification(senderId, recipientId, postId) {
        if (senderId === recipientId) return; // Don't notify self

        return await this.create({
            type: 'like',
            senderId: new ObjectId(senderId),
            recipientId: new ObjectId(recipientId),
            postId: new ObjectId(postId),
            message: 'liked your post'
        });
    }

    static async createCommentNotification(senderId, recipientId, postId, commentText) {
        if (senderId === recipientId) return;

        return await this.create({
            type: 'comment',
            senderId: new ObjectId(senderId),
            recipientId: new ObjectId(recipientId),
            postId: new ObjectId(postId),
            message: 'commented on your post',
            preview: commentText.substring(0, 50)
        });
    }

    static async createFollowNotification(senderId, recipientId) {
        if (senderId === recipientId) return;

        return await this.create({
            type: 'follow',
            senderId: new ObjectId(senderId),
            recipientId: new ObjectId(recipientId),
            message: 'started following you'
        });
    }
}

module.exports = Notification;
