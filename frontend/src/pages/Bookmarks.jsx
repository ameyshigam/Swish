import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Bookmark, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Bookmarks = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const res = await axios.get('/posts/bookmarks');
                setPosts(res.data);
            } catch (error) {
                console.error("Failed to fetch bookmarks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Bookmark className="text-white" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved</h2>
                    <p className="text-slate-500 text-sm">{posts.length} {posts.length === 1 ? 'post' : 'posts'} saved</p>
                </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="text-slate-400" size={28} />
                    </div>
                    <p className="text-slate-600 font-medium mb-1">No saved posts yet</p>
                    <p className="text-slate-400 text-sm mb-4">
                        Tap the bookmark icon on posts to save them here
                    </p>
                    <Link
                        to="/explore"
                        className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Explore Posts
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookmarks;

