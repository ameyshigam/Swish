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

        // Fetch existing user to preserve avatar URL
        const existingUser = await User.findById(req.user.id);
        const existingProfileData = existingUser?.profileData || {};

        const profileData = {
            bio: bio !== undefined ? bio : (existingProfileData.bio || ''),
            location: location !== undefined ? location : (existingProfileData.location || ''),
            website: website !== undefined ? website : (existingProfileData.website || ''),
            avatarUrl: existingProfileData.avatarUrl || '' // Preserve existing avatar
        };

        const result = await User.updateProfile(req.user.id, profileData);

        console.log('Profile update result:', result); // Debug log

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

        const avatarUrl = `/uploads/${req.file.filename}`;
        await User.updateAvatar(req.user.id, avatarUrl);

        res.json({ message: 'Avatar updated', avatarUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Follow/Unfollow user
const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;

        if (req.user.id === targetUserId) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const result = await User.toggleFollow(req.user.id, targetUserId);

        // Send notification if followed (not unfollowed)
        if (result.followed) {
            await Notification.createFollowNotification(req.user.id, targetUserId);
        }

        res.json(result);
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
    getUserPosts
};
