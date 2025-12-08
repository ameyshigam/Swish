import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Loader2, TrendingUp, Search, UserPlus, X, Compass, Sparkles, Users, ArrowRight } from 'lucide-react';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsRes, usersRes] = await Promise.all([
                    axios.get('/posts/explore'),
                    axios.get('/users/suggested')
                ]);
                setPosts(postsRes.data);
                setSuggestedUsers(usersRes.data);
            } catch (err) {
                console.error("Failed to fetch explore data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const res = await axios.get(`/users/search?q=${searchQuery}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setSearching(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleFollow = async (userId) => {
        try {
            await axios.put(`/users/${userId}/follow`);
            setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            console.error("Follow failed:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Bento Grid Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Search Card - Spans 8 columns */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                <Compass className="text-white" size={18} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">Explore</h1>
                                <p className="text-xs text-slate-500">Discover new people and content</p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 px-4 py-3">
                                <Search className="text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for users..."
                                    className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                                {searching && <Loader2 className="animate-spin text-slate-400" size={16} />}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl overflow-hidden z-20 shadow-xl">
                                    {searchResults.map(user => (
                                        <Link
                                            key={user._id}
                                            to={`/user/${user._id}`}
                                            onClick={() => setSearchQuery('')}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{user.username}</p>
                                                <p className="text-xs text-slate-500">{user.role}</p>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Card - Spans 4 columns */}
                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 h-full text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={18} />
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Today</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-80">Trending Posts</span>
                                <span className="text-xl font-bold">{posts.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-80">New Users</span>
                                <span className="text-xl font-bold">{suggestedUsers.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggested Users */}
            {suggestedUsers.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-slate-500" />
                            <h3 className="font-semibold text-slate-900">People to follow</h3>
                        </div>
                        <span className="text-xs text-slate-400">{suggestedUsers.length} suggestions</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {suggestedUsers.slice(0, 6).map(user => (
                            <div key={user._id} className="bg-slate-50 rounded-xl p-3 text-center group hover:bg-slate-100 transition-colors">
                                <Link to={`/user/${user._id}`}>
                                    <div className="w-14 h-14 mx-auto rounded-xl bg-slate-900 flex items-center justify-center text-white text-lg font-bold mb-2 group-hover:scale-105 transition-transform">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                    <p className="font-semibold text-slate-900 truncate text-sm">{user.username}</p>
                                    <p className="text-[10px] text-slate-500 mb-2">{user.role}</p>
                                </Link>
                                <button
                                    onClick={() => handleFollow(user._id)}
                                    className="w-full py-1.5 text-[10px] font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trending Posts */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-white" size={16} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Trending</h2>
                        <p className="text-xs text-slate-500">Popular posts right now</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={36} className="text-slate-300" />
                        </div>
                        <p className="text-slate-700 font-semibold mb-1">No trending posts</p>
                        <p className="text-slate-400 text-sm">Check back later for popular content</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;



