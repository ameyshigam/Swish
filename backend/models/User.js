const { getDB } = require('../config/db');

class User {
    static collection() {
        return getDB().collection('users');
    }

    static async create(userData) {
        const result = await this.collection().insertOne({
            ...userData,
            createdAt: new Date(),
        });
        return result;
    }

    static async findByEmail(email) {
        return await this.collection().findOne({ email });
    }

    static async findById(id) {
        const { ObjectId } = require('mongodb');
        return await this.collection().findOne({ _id: new ObjectId(id) });
    }
}

module.exports = User;
