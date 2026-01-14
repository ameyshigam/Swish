const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { ObjectId } = require('mongodb');

// Get user profile by ID
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's posts count
        const posts = await Post.findByAuthor(userId);

        // Check if current user is following this profile
        const currentUser = await User.findById(req.user.id);
        const isFollowing = currentUser?.following?.some(id => id.toString() === userId);
        const hasRequested = currentUser?.sentRequests?.some(id => id.toString() === userId);

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileData: user.profileData,
            followerCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0,
            postCount: posts.length,
            isFollowing,
            hasRequested,
            isOwnProfile: req.user.id === userId,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update own profile
const updateProfile = async (req, res) => {
    try {
        const { bio, location, website } = req.body;
        const profileUpdates = {};

        if (bio !== undefined) profileUpdates.bio = bio;
        if (location !== undefined) profileUpdates.location = location;
        if (website !== undefined) profileUpdates.website = website;

        await User.updateProfile(req.user.id, profileUpdates);

        // Fetch updated user to return complete profile data
        const updatedUser = await User.findById(req.user.id);
        const profileData = updatedUser?.profileData || {};

        console.log('Profile updated for user:', req.user.id);

        res.json({ message: 'Profile updated', profileData });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update avatar
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const avatarUrl = req.file.path;
        await User.updateAvatar(req.user.id, avatarUrl);

        res.json({ message: 'Avatar updated', avatarUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Follow/Unfollow user (Send Request)
const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        if (req.user.id === targetUserId) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const result = await User.toggleFollow(req.user.id, targetUserId);

        if (result.status === 'requested') {
            await Notification.createFollowRequestNotification(req.user.id, targetUserId);
            return res.json({ message: 'Follow request sent', status: 'requested' });
        } else if (result.status === 'unfollowed') {
            return res.json({ message: 'Unfollowed user', status: 'unfollowed' });
        } else if (result.status === 'already_requested_or_following') {
            return res.status(400).json({ message: 'Already requested or following' });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const respondToFollowRequest = async (req, res) => {
    try {
        const { requesterId, action } = req.body; // action: 'accept' or 'reject'

        if (action === 'accept') {
            await User.acceptFollowRequest(req.user.id, requesterId);

            // Notify the requester that their request was accepted
            await Notification.createFollowAcceptNotification(req.user.id, requesterId);

            // Update the original request notification for the current user
            await Notification.handleFollowRequestResponse(requesterId, req.user.id, 'accept');

            res.json({ message: 'Request accepted', status: 'accepted' });
        } else if (action === 'reject') {
            await User.rejectFollowRequest(req.user.id, requesterId);
            // Remove the original request notification
            await Notification.handleFollowRequestResponse(requesterId, req.user.id, 'reject');

            res.json({ message: 'Request rejected', status: 'rejected' });
        } else {
            res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getFollowRequests = async (req, res) => {
    try {
        const requests = await User.getFollowRequests(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get followers list
const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const followers = await User.getFollowers(userId);
        res.json(followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get following list
const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const following = await User.getFollowing(userId);
        res.json(following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const users = await User.searchUsers(q);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get suggested users to follow
const getSuggestedUsers = async (req, res) => {
    try {
        const users = await User.getSuggestedUsers(req.user.id, 5);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get posts by a specific user
const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const posts = await Post.findByAuthor(userId);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    updateAvatar,
    toggleFollow,
    getFollowers,
    getFollowing,
    searchUsers,
    getSuggestedUsers,
    getUserPosts,
    respondToFollowRequest,
    getFollowRequests
};
