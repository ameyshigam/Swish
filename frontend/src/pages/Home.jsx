import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import RecentMessages from '../components/RecentMessages';
import { Loader2, RefreshCw, Home as HomeIcon, Plus, Grid, LayoutGrid, Grid3x3 } from 'lucide-react';
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
            
            // Validate response structure
            if (!res.data || !Array.isArray(res.data.posts)) {
                console.error("Invalid feed response:", res.data);
                throw new Error("Invalid feed response");
            }

            if (append) {
                setPosts(prev => [...prev, ...res.data.posts]);
            } else {
                setPosts(res.data.posts);
            }
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            // More specific error message
            const errMsg = err.response?.data?.message || err.message || "Could not load feed.";
            setError(errMsg);
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
            <div className="bg-[#0b1720] border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="text-red-400" size={28} />
                </div>
                <p className="text-slate-300 font-medium mb-1">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                    <RefreshCw size={16} />
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
            {/* Stories row (narrower) */}
            <div className="lg:col-span-2">
                <div className="bg-[#0b1720] border border-slate-800 rounded-3xl p-4 lg:p-6">
                    <Stories />
                </div>
            </div>

            {/* Main column (feed) */}
            <div className="lg:col-span-2 space-y-6">

                {/* Feed Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Grid3x3 className="text-white" size={20} />
                        <div>
                            <h2 className="text-xl font-bold text-white">Feed</h2>
                            <p className="text-xs text-slate-400">{posts.length} posts</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-[#0b1720] rounded-xl transition-colors"
                        title="Refresh feed"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {posts.length === 0 ? (
                    <div className="bg-[#0b1720] border border-slate-800 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Plus className="text-slate-600" size={36} />
                        </div>
                        <p className="text-slate-300 font-semibold mb-1">No posts yet</p>
                        <p className="text-slate-400 text-sm mb-6">Be the first to share something with your campus!</p>
                        <Link
                            to="/create"
                            className="inline-flex items-center px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Create Post
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Posts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                                    className="w-full py-3 bg-[#0b1720] border border-slate-800 hover:border-slate-700 rounded-xl font-medium text-slate-400 transition-all hover:shadow-sm disabled:opacity-50"
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

            {/* Right column: Messages / sidebar */}
            <aside className="lg:col-span-1 lg:flex lg:flex-col lg:items-end">
                <div className="space-y-4 lg:mt-10 lg:w-full lg:pr-4">
                    <RecentMessages />
                    {/* future sidebar cards can go here */}
                </div>
            </aside>
        </div>
    );
};

export default Home;



