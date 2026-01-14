import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import RecentMessages from '../components/RecentMessages';
import { Grid3x3, Plus, RefreshCw, Loader, Loader2, AlertCircle, CheckCircle2, SlidersHorizontal, Heart, MessageCircle, Share2, Bookmark, Home as HomeIcon } from 'lucide-react';
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
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
                <p className="text-muted-foreground font-medium mb-1">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
            {/* Stories row */}
            <div className="lg:col-span-2 space-y-6">
                <div className="neo-card p-4 lg:p-6">
                    <Stories />
                </div>

                {/* Header */}
                <div className="neo-card p-6 mb-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
                                <HomeIcon className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground leading-tight">Your Feed</h1>
                                <p className="text-muted-foreground text-sm">See what's happening on campus</p>
                            </div>
                        </div>
                        <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors">
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="neo-card p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Plus className="text-primary" size={36} />
                        </div>
                        <p className="text-foreground font-semibold mb-1">No posts yet</p>
                        <p className="text-muted-foreground text-sm mb-6">Be the first to share something with your campus!</p>
                        <Link
                            to="/create"
                            className="glow-button inline-flex items-center px-6 py-3"
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
                                    className="w-full py-3 bg-card border border-border hover:border-muted-foreground/30 rounded-xl font-medium text-muted-foreground transition-all hover:shadow-sm disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            Loading...
                                        </span>
                                    ) : (
                                        'Load more posts'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* End of feed */}
                        {pagination && !pagination.hasMore && posts.length > 0 && (
                            <div className="text-center text-muted-foreground text-sm py-6">
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
