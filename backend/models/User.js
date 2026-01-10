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
        // Convert profileData to dot notation to avoid overwriting entire object
        const updateFields = {};
        for (const [key, value] of Object.entries(profileData)) {
            updateFields[`profileData.${key}`] = value;
        }
        updateFields['updatedAt'] = new Date();

        const result = await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateFields }
        );
        return result;
    }

    static async updateAvatar(userId, avatarUrl) {
        return await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { 'profileData.avatarUrl': avatarUrl } }
        );
    }

    static async sendFollowRequest(userId, targetUserId) {
        const user = await this.findById(userId);
        const targetUser = await this.findById(targetUserId);

        if (!user || !targetUser) throw new Error('User not found');

        // Check if already following or requested
        const isFollowing = user.following?.some(id => id.toString() === targetUserId);
        const hasRequested = user.sentRequests?.some(id => id.toString() === targetUserId);

        if (isFollowing || hasRequested) {
            return { status: 'already_requested_or_following' };
        }

        // Add to sender's sentRequests
        await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { sentRequests: new ObjectId(targetUserId) } }
        );

        // Add to target's followRequests
        await this.collection().updateOne(
            { _id: new ObjectId(targetUserId) },
            { $addToSet: { followRequests: new ObjectId(userId) } }
        );

        return { status: 'requested' };
    }

    static async acceptFollowRequest(userId, requesterId) {
        // userId is the one accepting (target), requesterId is the one who sent request
        
        // Mutual Follow Logic: Accepting a request creates a two-way friendship
        
        // 1. Update Target User (Accepter)
        await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { 
                $pull: { followRequests: new ObjectId(requesterId) },
                $addToSet: { 
                    followers: new ObjectId(requesterId),
                    following: new ObjectId(requesterId) // Auto-follow back
                }
            }
        );

        // 2. Update Requester User
        await this.collection().updateOne(
            { _id: new ObjectId(requesterId) },
            {
                $addToSet: {
                    followers: new ObjectId(userId), // Auto-follow back
                    following: new ObjectId(userId)
                }
            }
        );

        return { status: 'accepted' };
    }

    static async rejectFollowRequest(userId, requesterId) {
        await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { followRequests: new ObjectId(requesterId) } }
        );

        await this.collection().updateOne(
            { _id: new ObjectId(requesterId) },
            { $pull: { sentRequests: new ObjectId(userId) } }
        );

        return { status: 'rejected' };
    }

    static async unfollow(userId, targetUserId) {
        await this.collection().updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { following: new ObjectId(targetUserId) } }
        );
        await this.collection().updateOne(
            { _id: new ObjectId(targetUserId) },
            { $pull: { followers: new ObjectId(userId) } }
        );
        return { status: 'unfollowed' };
    }

    static async toggleFollow(userId, targetUserId) {
        // Deprecated or modify to use new logic if needed, but keeping for backward compatibility
        // For this task, we prefer the request system. 
        // We will repurpose this to just handle unfollow if already following.
        // If not following, it should probably call sendFollowRequest.
        
        const user = await this.findById(userId);
        const isFollowing = user.following?.some(id => id.toString() === targetUserId);

        if (isFollowing) {
            return await this.unfollow(userId, targetUserId);
        } else {
            return await this.sendFollowRequest(userId, targetUserId);
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

    static async getFollowRequests(userId) {
        const user = await this.findById(userId);
        if (!user) return [];

        return await this.collection().find(
            { _id: { $in: user.followRequests || [] } },
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
        const sentRequests = user?.sentRequests || [];

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
                    followerCount: { $size: { $ifNull: ['$followers', []] } },
                    hasRequested: { $in: ['$_id', sentRequests] }
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

    static async findAllStudents() {
        // Assuming students have role 'Student' or undefined (if default)
        // Adjust query based on actual data. For now, assuming explicit role 'Student'
        // If your system defaults to Student, use { $or: [{ role: 'Student' }, { role: { $exists: false } }] }
        return await this.collection().find({ role: 'Student' }).toArray();
    }
}

module.exports = User;
