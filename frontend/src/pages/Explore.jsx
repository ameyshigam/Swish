import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Loader2, TrendingUp, Search, UserPlus, UserMinus, X, Compass, Sparkles, Users, ArrowRight, Clock } from 'lucide-react';

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
                // Fetch both users and posts
                const [usersRes, postsRes] = await Promise.all([
                    axios.get(`/users/search?q=${searchQuery}`),
                    axios.get(`/posts/search?q=${searchQuery}`)
                ]);

                // Combine and format results
                const users = usersRes.data.map(u => ({ ...u, type: 'user' }));
                const posts = postsRes.data.map(p => ({ ...p, type: 'post' }));

                setSearchResults([...users, ...posts]);
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
            const res = await axios.put(`/users/${userId}/follow`);
            setSuggestedUsers(prev => prev.map(u => {
                if (u._id === userId) {
                    return {
                        ...u,
                        isFollowing: false, // Since we only support requests now for new follows
                        hasRequested: res.data.status === 'requested'
                    };
                }
                return u;
            }));
        } catch (err) {
            console.error("Follow failed:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Bento Grid Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Search Card - Spans 8 columns */}
                {/* Search Card - Spans 8 columns */}
                <div className="lg:col-span-8 relative z-20">
                    <div className="glass-card p-6 h-full relative group">
                        {/* Decorative Gradient Blob - Wrapped to prevent overflow clipping of dropdown */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        </div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Compass className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Explore</h1>
                                <p className="text-sm text-muted-foreground">Discover new people and content</p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative z-10">
                            <div className="glass-search flex items-center gap-3 px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 shadow-sm">
                                <Search className="text-muted-foreground" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for people or posts..."
                                    className="flex-1 text-base text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                                {searching && <Loader2 className="animate-spin text-primary" size={18} />}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto">

                                    {/* Users Section */}
                                    {searchResults.some(r => r.type === 'user') && (
                                        <div className="py-2">
                                            <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">People</div>
                                            {searchResults.filter(r => r.type === 'user').map(user => (
                                                <Link
                                                    key={user._id}
                                                    to={`/user/${user._id}`}
                                                    onClick={() => setSearchQuery('')}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10 group-hover/item:ring-white/20 transition-all">
                                                        {user.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-100 text-sm truncate group-hover/item:text-primary transition-colors">{user.username}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Divider if both exist */}
                                    {searchResults.some(r => r.type === 'user') && searchResults.some(r => r.type === 'post') && (
                                        <div className="h-px bg-gray-800 mx-4 my-1"></div>
                                    )}

                                    {/* Posts Section */}
                                    {searchResults.some(r => r.type === 'post') && (
                                        <div className="py-2">
                                            <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Posts</div>
                                            {searchResults.filter(r => r.type === 'post').map(post => (
                                                <Link
                                                    key={post._id}
                                                    to={`/post/${post._id}`}
                                                    onClick={() => setSearchQuery('')}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white overflow-hidden shadow-md ring-1 ring-white/10 group-hover/item:ring-white/20 transition-all">
                                                        {post.imageUrl ? (
                                                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <TrendingUp size={16} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-foreground text-sm truncate group-hover/item:text-primary transition-colors">{post.caption}</p>
                                                        <p className="text-xs text-gray-400 truncate">by {post.author?.username}</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}



                        </div>
                    </div>
                </div>

                {/* Stats Card - Spans 4 columns */}
                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-2xl p-6 h-full text-white relative overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Daily Pulse</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                    <span className="text-sm font-medium opacity-90">Trending Posts</span>
                                    <span className="text-2xl font-bold tracking-tight">{posts.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                    <span className="text-sm font-medium opacity-90">New Users</span>
                                    <span className="text-2xl font-bold tracking-tight">{suggestedUsers.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Suggested Users */}
            {
                suggestedUsers.length > 0 && (
                    <div className="neo-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users size={18} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">People to follow</h3>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">{suggestedUsers.length} suggestions</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {suggestedUsers.slice(0, 6).map(user => (
                                <div key={user._id} className="relative neo-card p-4 text-center group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                    <Link to={`/user/${user._id}`}>
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 p-[2px] mb-3 group-hover:scale-105 transition-transform duration-300 shadow-md">
                                            <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                                                {user.username?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                        <p className="font-bold text-foreground truncate text-sm mb-1">{user.username}</p>

                                        {/* Role Badge */}
                                        <div className="mb-3 flex justify-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${user.role === 'Admin'
                                                ? 'bg-red-500/10 text-red-500'
                                                : user.role === 'Faculty'
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleFollow(user._id)}
                                        className={`w-full py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${user.isFollowing
                                            ? 'bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive'
                                            : user.hasRequested
                                                ? 'bg-secondary text-muted-foreground cursor-default'
                                                : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95'
                                            }`}
                                    >
                                        {user.isFollowing ? (
                                            <>
                                                <UserMinus size={14} /> Unfollow
                                            </>
                                        ) : user.hasRequested ? (
                                            <>
                                                <Clock size={14} /> Requested
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={14} /> Follow
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Trending Posts */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Trending</h2>
                        <p className="text-sm text-muted-foreground">Popular posts right now</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={36} className="text-muted-foreground" />
                        </div>
                        <p className="text-foreground font-semibold mb-1">No trending posts</p>
                        <p className="text-muted-foreground text-sm">Check back later for popular content</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} overlay={true} />
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Explore;



