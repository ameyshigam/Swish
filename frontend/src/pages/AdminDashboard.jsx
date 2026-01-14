import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, AlertTriangle, FileText, Loader2, Compass, Search } from 'lucide-react';
import PostCard from '../components/PostCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, postsRes] = await Promise.all([
                    axios.get('/admin/stats'),
                    axios.get('/posts/explore')
                ]);
                setStats(statsRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to load dashboard data.");
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (error) {
        return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground text-glow">Dashboard</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Overview of your platform's performance</p>
                </div>
                <div className="px-5 py-2.5 bg-card/60 backdrop-blur-md border border-border/50 rounded-full text-sm font-semibold text-foreground shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="neo-card p-6 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl neo-shape">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">+12%</span>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium relative z-10">Total Users</h3>
                    <p className="text-3xl font-bold text-foreground mt-2 relative z-10">{stats?.users || 0}</p>
                </div>

                <div className="neo-card p-6 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">+5%</span>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium relative z-10">Total Posts</h3>
                    <p className="text-3xl font-bold text-foreground mt-2 relative z-10">{stats?.posts || 0}</p>
                </div>

                <div className="neo-card p-6 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
                            <AlertTriangle size={24} />
                        </div>
                        {stats?.pendingReports > 0 && <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 rounded-full border border-orange-500/20">Action</span>}
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium relative z-10">Pending Reports</h3>
                    <p className="text-3xl font-bold text-foreground mt-2 relative z-10">{stats?.pendingReports || 0}</p>
                </div>

                <div className="neo-card p-6 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <Shield size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium relative z-10">Total Reports</h3>
                    <p className="text-3xl font-bold text-foreground mt-2 relative z-10">{stats?.reports || 0}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                        <Compass className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Explore & Trending</h2>
                        <p className="text-sm text-muted-foreground">Monitor trending content across the platform</p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative max-w-2xl group">
                    <div className="glass border border-border/50 rounded-2xl flex items-center gap-3 px-5 py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 shadow-sm hover:shadow-md">
                        <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for users..."
                            className="flex-1 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none bg-transparent"
                        />
                        {searching && <Loader2 className="animate-spin text-primary" size={18} />}
                    </div>

                    {/* Search Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                            {searchResults.map(user => (
                                <a
                                    key={user._id}
                                    href={`/user/${user._id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <div className="w-8 h-8 bg-muted rounded-full overflow-hidden">
                                        {user.profilePicture && (
                                            <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{user.username}</p>
                                        <p className="text-xs text-muted-foreground">{user.fullName}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;