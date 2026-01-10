const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Story {
    static collection() {
        return getDB().collection('stories');
    }

    static async create(storyData) {
        const result = await this.collection().insertOne({
            ...storyData,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            viewers: []
        });
        return result;
    }

    static async getFriendsStories(friendIds) {
        // Find stories where userId is in friendIds
        const now = new Date();
        return await this.collection().aggregate([
            {
                $match: {
                    userId: { $in: friendIds.map(id => new ObjectId(id)) },
                    expiresAt: { $gt: now }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    'user.password': 0,
                    'user.email': 0,
                    'user.followers': 0,
                    'user.following': 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]).toArray();
    }
    
    static async getMyStories(userId) {
        const now = new Date();
        return await this.collection().find({
            userId: new ObjectId(userId),
            expiresAt: { $gt: now }
        }).sort({ createdAt: -1 }).toArray();
    }

    static async findById(id) {
        return await this.collection().findOne({ _id: new ObjectId(id) });
    }

    static async delete(id) {
        return await this.collection().deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = Story;