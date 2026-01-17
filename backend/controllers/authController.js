const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Domain Constraint - DISABLED for development
        // if (!email.endsWith('@model.edu.in')) {
        //     return res.status(400).json({ message: 'Registration restricted to @model.edu.in emails only' });
        // }

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Normalize Role (accept both 'teacher' and 'faculty' from frontend)
        let assignedRole = 'Student';
        if (role) {
            const r = role.toLowerCase();
            if (r === 'admin') assignedRole = 'Admin';
            else if (r === 'teacher' || r === 'faculty') assignedRole = 'Faculty';
            else if (r === 'student') assignedRole = 'Student';
        }

        // Create user
        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: assignedRole,
            profileData: {
                bio: '',
                avatarUrl: ''
            }
        };

        const result = await User.create(newUser);

        // Generate JWT
        const token = jwt.sign(
            { id: String(result.insertedId), role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: String(result.insertedId),
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                profileData: newUser.profileData
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Special Admin Login
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@model.edu.in';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === adminEmail && adminPassword && password === adminPassword) {
            // Find or Create Admin
            let adminUser = await User.findByEmail(email);
            if (!adminUser) {
                // Create the admin user if not exists
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                const newAdmin = {
                    username: 'SuperAdmin',
                    email: email,
                    password: hashedPassword,
                    role: 'Admin',
                    profileData: {
                        bio: 'System Administrator',
                        avatarUrl: ''
                    }
                };
                const result = await User.create(newAdmin);
                adminUser = { ...newAdmin, _id: result.insertedId };
            }

            // Generate JWT for Admin
            const token = jwt.sign(
                { id: String(adminUser._id), role: 'Admin' },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            return res.status(200).json({
                token,
                user: {
                    id: String(adminUser._id),
                    username: adminUser.username,
                    email: adminUser.email,
                    role: adminUser.role,
                    profileData: adminUser.profileData
                }
            });
        }

        // Domain Constraint for Regular Users - DISABLED for development
        // if (!email.endsWith('@model.edu.in')) {
        //     return res.status(403).json({ message: 'Access restricted to @model.edu.in emails' });
        // }

        // Check user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: String(user._id), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            token,
            user: {
                id: String(user._id),
                username: user.username,
                email: user.email,
                role: user.role,
                profileData: user.profileData
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: String(user._id),
            username: user.username,
            email: user.email,
            role: user.role,
            profileData: user.profileData,
            bookmarks: user.bookmarks || []
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.collection().find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.collection().deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const Post = require('../models/Post'); // Ensure Post model is imported

// Get public stats (Users, Posts)
const getPublicStats = async (req, res) => {
    try {
        const userCount = await User.collection().countDocuments();
        const postCount = await Post.collection().countDocuments();
        // Since we don't have a Community model yet, we'll use a placeholder or 0
        // Or we could count unique faculties/departments if we had that data structure
        const communityCount = 0;

        res.json({
            users: userCount,
            posts: postCount,
            communities: communityCount
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser: register, loginUser: login, getMe, getAllUsers, deleteUser, getPublicStats };
