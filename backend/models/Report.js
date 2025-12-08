const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Report {
    static collection() {
        return getDB().collection('reports');
    }

    static async create(reportData) {
        const result = await this.collection().insertOne({
            ...reportData,
            status: 'pending', // pending, reviewed, resolved, dismissed
            createdAt: new Date(),
        });
        return result;
    }

    static async findAll(filter = {}) {
        return await this.collection().aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reporterId',
                    foreignField: '_id',
                    as: 'reporter'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'postId',
                    foreignField: '_id',
                    as: 'post'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reportedUserId',
                    foreignField: '_id',
                    as: 'reportedUser'
                }
            },
            {
                $unwind: {
                    path: '$reporter',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$post',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$reportedUser',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'reporter.password': 0,
                    'reporter.email': 0,
                    'reportedUser.password': 0,
                    'reportedUser.email': 0
                }
            }
        ]).toArray();
    }

    static async updateStatus(reportId, status, adminNotes = '') {
        return await this.collection().updateOne(
            { _id: new ObjectId(reportId) },
            {
                $set: {
                    status,
                    adminNotes,
                    reviewedAt: new Date()
                }
            }
        );
    }

    static async getPendingCount() {
        return await this.collection().countDocuments({ status: 'pending' });
    }
}

module.exports = Report;
