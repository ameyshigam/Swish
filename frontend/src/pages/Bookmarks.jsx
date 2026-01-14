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
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="neo-card p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Bookmark className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Saved Posts</h1>
                        <p className="text-muted-foreground text-sm">{posts.length} {posts.length === 1 ? 'post' : 'posts'} bookmarked</p>
                    </div>
                </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
                <div className="neo-card p-12 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No bookmarks yet</h3>
                    <p className="text-muted-foreground">Posts you bookmark will appear here for easy access.</p>
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

