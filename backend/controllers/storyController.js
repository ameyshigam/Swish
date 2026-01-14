const Story = require('../models/Story');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

const createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image/video' });
        }

        const mediaUrl = req.file.path;
        const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';

        await Story.create({
            userId: new ObjectId(req.user.id),
            mediaUrl,
            type,
        });

        res.status(201).json({ message: 'Story created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getStories = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const followingIds = user.following || [];

        // Include friends' stories and my own
        const idsToFetch = [...followingIds, new ObjectId(req.user.id)];

        const stories = await Story.getFriendsStories(idsToFetch);
        res.json(stories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteStory = async (req, res) => {
    try {
        const storyId = req.params.id;
        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Story.delete(storyId);
        res.json({ message: 'Story deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createStory, getStories, deleteStory };