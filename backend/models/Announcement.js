const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const VALID_CATEGORIES = [
    'Latest announcements',
    'Exam Notifications',
    'Scholarship Section',
    'Cultural Events',
    'IEEE & CSI'
];

class Announcement {
    static collection() {
        return getDB().collection('announcements');
    }

    static async create(data) {
        // Case-insensitive category matching
        let category = 'Latest announcements';
        const providedCategory = data.category;
        
        if (providedCategory) {
            const match = VALID_CATEGORIES.find(c => c.toLowerCase() === providedCategory.toLowerCase());
            if (match) {
                category = match;
            }
        }

        const doc = {
            subject: data.subject,
            description: data.description,
            priority: data.priority || 'Medium',
            category,
            photo: data.photo || null,
            fileUrl: data.fileUrl || null,
            targetSection: data.targetSection || null, // For scholarship notices
            createdBy: data.createdBy ? new ObjectId(data.createdBy) : null,
            createdAt: new Date()
        };

        const result = await this.collection().insertOne(doc);
        if (result.insertedId) {
            return await this.collection().findOne({ _id: result.insertedId });
        }
        return null;
    }

    static async getAll({ category = null, limit = 50 } = {}) {
        const q = {};
        if (category && VALID_CATEGORIES.includes(category)) q.category = category;

        return await this.collection().find(q).sort({ createdAt: -1 }).limit(limit).toArray();
    }

    static async delete(id) {
        return await this.collection().deleteOne({ _id: new ObjectId(id) });
    }

    static async findById(id) {
        return await this.collection().findOne({ _id: new ObjectId(id) });
    }
}

module.exports = Announcement;

