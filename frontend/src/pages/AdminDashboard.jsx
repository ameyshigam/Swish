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
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-100">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.users || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Total Posts</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.posts || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Pending Reports</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.pendingReports || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Shield size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Total Reports</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.reports || 0}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                        <Compass className="text-white" size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-100">Explore & Trending</h1>
                        <p className="text-xs text-slate-300">Monitor trending content across the platform</p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative max-w-2xl">
                    <div className="bg-white border border-slate-200 rounded-xl flex items-center gap-3 px-4 py-3">
                        <Search className="text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for users..."
                            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                        {searching && <Loader2 className="animate-spin text-slate-400" size={16} />}
                    </div>

                    {/* Search Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            {searchResults.map(user => (
                                <a
                                    key={user._id}
                                    href={`/user/${user._id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                                        {user.profilePicture && (
                                            <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                                        <p className="text-xs text-slate-500">{user.fullName}</p>
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