const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Post {
    static collection() {
        return getDB().collection('posts');
    }

    static async create(postData) {
        const result = await this.collection().insertOne({
            ...postData,
            likes: [],
            comments: [],
            createdAt: new Date(),
        });
        return result;
    }

    static async findAll() {
        return await this.collection().aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0
                }
            }
        ]).toArray();
    }

    static async findAllPaginated(skip = 0, limit = 10) {
        return await this.collection().aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0
                }
            }
        ]).toArray();
    }

    static async findFeed(followingIds, userId, skip = 0, limit = 10) {
        // followingIds is an array of ObjectIds of people the user follows (and who accepted)
        // We also want to see our own posts? Usually yes.
        const idsToFetch = [...followingIds, new ObjectId(userId)];

        return await this.collection().aggregate([
            { 
                $match: { 
                    authorId: { $in: idsToFetch } 
                } 
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0
                }
            }
        ]).toArray();
    }

    static async getFeedCount(followingIds, userId) {
        const idsToFetch = [...followingIds, new ObjectId(userId)];
        return await this.collection().countDocuments({
            authorId: { $in: idsToFetch }
        });
    }

    static async getCount() {
        return await this.collection().countDocuments();
    }

    static async findByAuthor(authorId) {
        return await this.collection().aggregate([
            {
                $match: { authorId: new ObjectId(authorId) }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0
                }
            }
        ]).toArray();
    }

    static async findExplore() {
        return await this.collection().aggregate([
            { $sort: { likes: -1, createdAt: -1 } }, // Popular first
            { $limit: 20 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'author.password': 0,
                    'author.email': 0
                }
            }
        ]).toArray();
    }

    static async like(postId, userId) {
        const post = await this.collection().findOne({ _id: new ObjectId(postId) });
        if (!post) throw new Error('Post not found');

        const likes = post.likes || [];
        const isLiked = likes.find(id => id.toString() === userId);

        if (isLiked) {
            await this.collection().updateOne(
                { _id: new ObjectId(postId) },
                { $pull: { likes: new ObjectId(userId) } }
            );
            return { liked: false };
        } else {
            await this.collection().updateOne(
                { _id: new ObjectId(postId) },
                { $addToSet: { likes: new ObjectId(userId) } }
            );
            return { liked: true };
        }
    }

    static async addComment(postId, userId, text, username) {
        const comment = {
            _id: new ObjectId(),
            userId: new ObjectId(userId),
            username,
            text,
            createdAt: new Date()
        };

        await this.collection().updateOne(
            { _id: new ObjectId(postId) },
            { $push: { comments: comment } }
        );

        return comment;
    }
}

module.exports = Post;
