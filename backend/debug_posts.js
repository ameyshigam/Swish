const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

const uri = "mongodb+srv://siddhivinayaksawant04_db_user:WWQb5kFl2oVXJ6A2@cluster0.yqekiyd.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db('test'); // Default DB name usually, check .env or connection string
        // The connection string doesn't specify DB, so it defaults to 'test' usually.
        // Let's check what DB is used in the app.
        // db.js uses process.env.MONGO_URI.
        
        // Let's assume the default db is used.
        const posts = await db.collection('posts').find().sort({ createdAt: -1 }).limit(5).toArray();
        
        console.log("Recent 5 posts:");
        posts.forEach(post => {
            console.log(`ID: ${post._id}`);
            console.log(`Caption: ${post.caption}`);
            console.log(`Image URL: ${post.imageUrl}`);
            
            // Check if file exists
            if (post.imageUrl) {
                const filename = post.imageUrl.replace('/uploads/', '');
                const filePath = path.join(__dirname, 'uploads', filename);
                const exists = fs.existsSync(filePath);
                console.log(`File path: ${filePath}`);
                console.log(`File exists: ${exists}`);
            }
            console.log('---');
        });

    } finally {
        await client.close();
    }
}

run().catch(console.dir);