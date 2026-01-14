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

    static async searchPosts(query, limit = 10) {
        return await this.collection().aggregate([
            {
                $match: {
                    caption: { $regex: query, $options: 'i' }
                }
            },
            { $limit: limit },
            ...this.authorLookupStage()
        ]).toArray();
    }

    static async populateCommentAuthors(posts) {
        if (!posts || posts.length === 0) return posts;

        const allComments = posts.flatMap(p => p.comments || []);
        if (allComments.length === 0) return posts;

        const userIds = [...new Set(allComments.map(c => c.userId))].filter(id => id); // Filter nulls

        if (userIds.length === 0) return posts;

        const users = await getDB().collection('users')
            .find({ _id: { $in: userIds } })
            .project({ _id: 1, 'profileData.avatarUrl': 1, username: 1 })
            .toArray();

        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        posts.forEach(post => {
            if (post.comments) {
                post.comments.forEach(comment => {
                    if (!comment.userAvatar && comment.userId) {
                        const author = userMap[comment.userId.toString()];
                        if (author) {
                            comment.userAvatar = author.profileData?.avatarUrl || '';
                            // Also ensure username is set if missing (optional fix)
                            if (!comment.username) comment.username = author.username;
                        }
                    }
                });
            }
        });

        return posts;
    }

    static async findAll() {
        const posts = await this.collection().aggregate([
            { $sort: { createdAt: -1 } },
            ...this.authorLookupStage()
        ]).toArray();
        return await this.populateCommentAuthors(posts);
    }

    static async findAllPaginated(skip = 0, limit = 10) {
        const posts = await this.collection().aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...this.authorLookupStage()
        ]).toArray();
        return await this.populateCommentAuthors(posts);
    }

    static async findFeed(followingIds, userId, skip = 0, limit = 10) {
        const idsToFetch = [...followingIds, new ObjectId(userId)];

        const posts = await this.collection().aggregate([
            {
                $match: {
                    authorId: { $in: idsToFetch }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...this.authorLookupStage()
        ]).toArray();
        return await this.populateCommentAuthors(posts);
    }

    static async getCount() {
        return await this.collection().countDocuments();
    }

    static async getFeedCount(followingIds, userId) {
        const idsToFetch = [...followingIds, new ObjectId(userId)];
        return await this.collection().countDocuments({
            authorId: { $in: idsToFetch }
        });
    }

    static async findByAuthor(authorId) {
        const posts = await this.collection().aggregate([
            {
                $match: { authorId: new ObjectId(authorId) }
            },
            { $sort: { createdAt: -1 } },
            ...this.authorLookupStage()
        ]).toArray();
        return await this.populateCommentAuthors(posts);
    }

    static async findExplore() {
        const posts = await this.collection().aggregate([
            { $sort: { likes: -1, createdAt: -1 } }, // Popular first
            { $limit: 20 },
            ...this.authorLookupStage()
        ]).toArray();
        return await this.populateCommentAuthors(posts);
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

    static async addComment(postId, userId, text, username, userAvatar) {
        const comment = {
            _id: new ObjectId(),
            userId: new ObjectId(userId),
            username,
            userAvatar,
            text,
            createdAt: new Date()
        };

        await this.collection().updateOne(
            { _id: new ObjectId(postId) },
            { $push: { comments: comment } }
        );

        return comment;
    }

    static async findByIdWithAuthor(id) {
        const result = await this.collection().aggregate([
            { $match: { _id: new ObjectId(id) } },
            ...this.authorLookupStage()
        ]).toArray();
        const populated = await this.populateCommentAuthors(result);
        return populated[0];
    }

    static async findBookmarksWithAuthor(bookmarkIds) {
        const posts = await this.collection().aggregate([
            { $match: { _id: { $in: bookmarkIds } } },
            ...this.authorLookupStage(),
            { $sort: { createdAt: -1 } }
        ]).toArray();
        return await this.populateCommentAuthors(posts);
    }

    // Helper for common aggregation stages
    static authorLookupStage() {
        return [
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
        ];
    }
}

module.exports = Post;
