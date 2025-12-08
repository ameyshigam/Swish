const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/swish_db';

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

const connectDB = async () => {
    try {
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        db = client.db(); // Uses the database name from the connection string
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};

module.exports = { connectDB, getDB, client };
