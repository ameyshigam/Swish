const Post = require('../models/Post');
const { ObjectId } = require('mongodb');

const createPost = async (req, res) => {
    try {
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const newPost = {
            authorId: new ObjectId(req.user.id),
            caption,
            imageUrl: `/uploads/${req.file.filename}`,
            likes: [],
            comments: []
        };

        const result = await Post.create(newPost);
        res.status(201).json({ message: 'Post created', postId: result.insertedId, post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.findByAuthor(req.user.id);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getExplorePosts = async (req, res) => {
    try {
        const posts = await Post.findExplore();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const toggleLike = async (req, res) => {
    try {
        const result = await Post.like(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const comment = await Post.addComment(req.params.id, req.user.id, text, req.user.username);
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deletePost = async (req, res) => {
    try {
        await Post.collection().deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createPost, getPosts, getUserPosts, getExplorePosts, toggleLike, addComment, deletePost };
