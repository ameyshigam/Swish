const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class User {
    static collection() {
        return getDB().collection('users');
    }

    static async create(userData) {
        const result = await this.collection().insertOne({
            ...userData,
            followers: [],
            following: [],
            createdAt: new Date(),
        });
        return result;
    }

    static async findByEmail(email) {
        return await this.collection().findOne({ email });
    }

    static async findById(id) {
        return await this.collection().findOne({ _id: new ObjectId(id) });
    }

    static async findByUsername(username) {
        return await this.collection().findOne({ username });
    }

    static async updateProfile(userId, profileData) {
        const result = await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    profileData,
                    updatedAt: new Date()
                }
            }
        );
        return result;
    }

    static async updateAvatar(userId, avatarUrl) {
        return await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { 'profileData.avatarUrl': avatarUrl } }
        );
    }

    static async toggleFollow(userId, targetUserId) {
        const user = await this.findById(userId);
        const targetUser = await this.findById(targetUserId);

        if (!user || !targetUser) {
            throw new Error('User not found');
        }

        const isFollowing = user.following?.some(id => id.toString() === targetUserId);

        if (isFollowing) {
            // Unfollow
            await this.collection().updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { following: new ObjectId(targetUserId) } }
            );
            await this.collection().updateOne(
                { _id: new ObjectId(targetUserId) },
                { $pull: { followers: new ObjectId(userId) } }
            );
            return { followed: false };
        } else {
            // Follow
            await this.collection().updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { following: new ObjectId(targetUserId) } }
            );
            await this.collection().updateOne(
                { _id: new ObjectId(targetUserId) },
                { $addToSet: { followers: new ObjectId(userId) } }
            );
            return { followed: true };
        }
    }

    static async getFollowers(userId) {
        const user = await this.findById(userId);
        if (!user) return [];

        return await this.collection().find(
            { _id: { $in: user.followers || [] } },
            { projection: { password: 0 } }
        ).toArray();
    }

    static async getFollowing(userId) {
        const user = await this.findById(userId);
        if (!user) return [];

        return await this.collection().find(
            { _id: { $in: user.following || [] } },
            { projection: { password: 0 } }
        ).toArray();
    }

    static async searchUsers(query, limit = 10) {
        return await this.collection().find(
            {
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            },
            { projection: { password: 0 } }
        ).limit(limit).toArray();
    }

    static async getSuggestedUsers(userId, limit = 5) {
        // Get users that current user is not following
        const user = await this.findById(userId);
        const following = user?.following || [];

        return await this.collection().aggregate([
            {
                $match: {
                    _id: {
                        $ne: new ObjectId(userId),
                        $nin: following
                    }
                }
            },
            {
                $addFields: {
                    followerCount: { $size: { $ifNull: ['$followers', []] } }
                }
            },
            { $sort: { followerCount: -1 } },
            { $limit: limit },
            { $project: { password: 0 } }
        ]).toArray();
    }

    // Bookmark functionality
    static async toggleBookmark(userId, postId) {
        const user = await this.findById(userId);
        const bookmarks = user?.bookmarks || [];
        const isBookmarked = bookmarks.some(id => id.toString() === postId);

        if (isBookmarked) {
            await this.collection().updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { bookmarks: new ObjectId(postId) } }
            );
            return { bookmarked: false };
        } else {
            await this.collection().updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { bookmarks: new ObjectId(postId) } }
            );
            return { bookmarked: true };
        }
    }

    static async getBookmarks(userId) {
        const user = await this.findById(userId);
        return user?.bookmarks || [];
    }
}

module.exports = User;
