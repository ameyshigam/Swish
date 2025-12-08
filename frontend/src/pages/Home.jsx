import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Loader2, RefreshCw, Home as HomeIcon, Plus, Grid, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    const fetchPosts = useCallback(async (page = 1, append = false) => {
        try {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await axios.get(`/posts?page=${page}&limit=12`);

            if (append) {
                setPosts(prev => [...prev, ...res.data.posts]);
            } else {
                setPosts(res.data.posts);
            }
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError("Could not load feed.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleLoadMore = () => {
        if (pagination?.hasMore) {
            fetchPosts(pagination.page + 1, true);
        }
    };

    const handleRefresh = () => {
        fetchPosts(1, false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="text-red-500" size={28} />
                </div>
                <p className="text-slate-600 font-medium mb-1">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw size={16} />
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center">
                        <LayoutGrid className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Feed</h2>
                        <p className="text-xs text-slate-500">{posts.length} posts</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Refresh feed"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-slate-300" size={36} />
                    </div>
                    <p className="text-slate-700 font-semibold mb-1">No posts yet</p>
                    <p className="text-slate-400 text-sm mb-6">Be the first to share something with your campus!</p>
                    <Link
                        to="/create"
                        className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Create Post
                    </Link>
                </div>
            ) : (
                <>
                    {/* Bento Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {pagination?.hasMore && (
                        <div className="pt-4">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-600 transition-all hover:shadow-sm disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Loading...
                                    </span>
                                ) : (
                                    'Load More'
                                )}
                            </button>
                        </div>
                    )}

                    {/* End of feed */}
                    {pagination && !pagination.hasMore && posts.length > 0 && (
                        <div className="text-center text-slate-400 text-sm py-6">
                            You're all caught up! 🎉
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;



