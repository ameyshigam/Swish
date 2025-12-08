import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Loader2, TrendingUp, Sparkles } from 'lucide-react';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExplorePosts = async () => {
            try {
                const res = await axios.get('/posts/explore');
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch explore posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchExplorePosts();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header / Hero */}
            <div className="glass rounded-3xl p-8 relative overflow-hidden mb-8">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Explore Swish</h1>
                    <p className="text-slate-500 font-medium">Discover what's trending on campus.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 px-2">
                <TrendingUp className="text-indigo-500" size={20} />
                <h2 className="text-xl font-bold text-slate-700">Trending Posts</h2>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    No trending posts found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Explore;
