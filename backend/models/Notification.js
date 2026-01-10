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

    static async createFollowRequestNotification(senderId, recipientId) {
        if (senderId === recipientId) return;

        return await this.create({
            type: 'follow_request',
            senderId: new ObjectId(senderId),
            recipientId: new ObjectId(recipientId),
            message: 'sent you a follow request'
        });
    }

    static async createFollowAcceptNotification(senderId, recipientId) {
        if (senderId === recipientId) return;

        return await this.create({
            type: 'follow_accept',
            senderId: new ObjectId(senderId),
            recipientId: new ObjectId(recipientId),
            message: 'accepted your follow request. We are friends now!'
        });
    }

    static async markFollowRequestAsRead(senderId, recipientId) {
        // Mark the request notification from senderId to recipientId as read
        return await this.collection().updateOne(
            { 
                type: 'follow_request',
                senderId: new ObjectId(senderId), 
                recipientId: new ObjectId(recipientId),
                read: false
            },
            { $set: { read: true } }
        );
    }

    static async createMessageNotification(senderId, recipientId, preview) {
        if (senderId === recipientId) return;
        return await this.create({
            type: 'message',
            senderId: new ObjectId(senderId),
            recipientId: new ObjectId(recipientId),
            message: 'sent you a message',
            preview: preview.substring(0, 50)
        });
    }

    static async handleFollowRequestResponse(senderId, recipientId, action) {
        // senderId is the person who sent the request (Requester)
        // recipientId is the person who is accepting/rejecting (Current User)
        
        if (action === 'accept') {
            // Update the notification to show they are now friends
            return await this.collection().updateOne(
                { 
                    type: 'follow_request',
                    senderId: new ObjectId(senderId), 
                    recipientId: new ObjectId(recipientId)
                },
                { 
                    $set: { 
                        type: 'follow_accept', 
                        message: 'is now your friend!',
                        read: true 
                    } 
                }
            );
        } else if (action === 'reject') {
            // Remove the notification
            return await this.collection().deleteOne({
                type: 'follow_request',
                senderId: new ObjectId(senderId), 
                recipientId: new ObjectId(recipientId)
            });
        }
    }

    static async createAnnouncementNotification(recipientId, announcementId, message) {
        return await this.create({
            type: 'announcement',
            recipientId: new ObjectId(recipientId),
            announcementId: new ObjectId(announcementId),
            message: message
        });
    }

    static async createBulk(notifications) {
        if (!notifications || notifications.length === 0) return;
        const docs = notifications.map(n => ({
            ...n,
            read: false,
            createdAt: new Date()
        }));
        return await this.collection().insertMany(docs);
    }
}

module.exports = Notification;
