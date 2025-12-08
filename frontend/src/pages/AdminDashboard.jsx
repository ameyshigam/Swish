import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Shield, Users, AlertTriangle, FileText, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const res = await axios.get('/admin/stats');
                setStats(res.data);
            } else if (activeTab === 'users') {
                const res = await axios.get('/auth/users');
                setUsers(res.data);
            } else if (activeTab === 'reports') {
                const res = await axios.get('/admin/reports');
                setReports(res.data);
            } else if (activeTab === 'posts') {
                const res = await axios.get('/admin/posts');
                setPosts(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError("Failed to load data. Are you an admin?");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        try {
            await axios.delete(`/auth/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            alert("Failed to delete user");
            console.error(err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            await axios.delete(`/admin/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            alert("Failed to delete post");
            console.error(err);
        }
    };

    const handleUpdateReport = async (reportId, status) => {
        try {
            await axios.put(`/admin/reports/${reportId}`, { status });
            setReports(reports.map(r => r._id === reportId ? { ...r, status } : r));
        } catch (err) {
            alert("Failed to update report");
            console.error(err);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Shield },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'reports', label: 'Reports', icon: AlertTriangle },
        { id: 'posts', label: 'Posts', icon: FileText },
    ];

    if (loading && !stats && !users.length && !reports.length && !posts.length) {
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
            {/* Header */}
            <div className="glass rounded-3xl p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Shield className="text-blue-400" /> Admin Dashboard
                    </h1>
                    <p className="text-slate-400">Manage users, content, and reports.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white/50 text-slate-600 hover:bg-white'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{stats.userCount}</div>
                                    <div className="text-sm text-slate-500">Total Users</div>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{stats.postCount}</div>
                                    <div className="text-sm text-slate-500">Total Posts</div>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{stats.pendingReports}</div>
                                    <div className="text-sm text-slate-500">Pending Reports</div>
                                </div>
                            </div>

                            {/* Role breakdown */}
                            <div className="glass-card p-6 rounded-2xl md:col-span-3">
                                <h3 className="font-bold text-slate-700 mb-4">Users by Role</h3>
                                <div className="flex gap-6">
                                    {stats.roleStats?.map(role => (
                                        <div key={role._id} className="text-center">
                                            <div className={`text-xl font-bold ${role._id === 'Admin' ? 'text-purple-600' :
                                                    role._id === 'Faculty' ? 'text-amber-600' : 'text-green-600'
                                                }`}>
                                                {role.count}
                                            </div>
                                            <div className="text-sm text-slate-500">{role._id || 'Unknown'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="glass-card rounded-3xl overflow-hidden border border-slate-100">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-800">User Management ({users.length})</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-semibold">User</th>
                                            <th className="p-4 font-semibold">Role</th>
                                            <th className="p-4 font-semibold">Joined</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map(u => (
                                            <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                                            {u.username?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{u.username}</div>
                                                            <div className="text-xs text-slate-400">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' :
                                                            u.role === 'Faculty' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-green-100 text-green-600'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {u.role !== 'Admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <div className="glass-card rounded-2xl p-8 text-center">
                                    <CheckCircle className="text-emerald-500 mx-auto mb-2" size={32} />
                                    <p className="text-slate-500">No reports to review</p>
                                </div>
                            ) : (
                                reports.map(report => (
                                    <div key={report._id} className={`glass-card rounded-2xl p-6 border-l-4 ${report.status === 'pending' ? 'border-l-amber-500' :
                                            report.status === 'resolved' ? 'border-l-emerald-500' : 'border-l-slate-300'
                                        }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${report.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                        report.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {report.status}
                                                </span>
                                                <span className="ml-2 text-sm text-slate-500">
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {report.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateReport(report._id, 'resolved')}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Mark as Resolved"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateReport(report._id, 'dismissed')}
                                                        className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-slate-700 mb-2">
                                            <span className="font-bold">{report.reporter?.username || 'Unknown'}</span>
                                            {' '}reported a <span className="font-medium">{report.type}</span> for <span className="text-red-500 font-medium">{report.reason}</span>
                                        </p>

                                        {report.reportedUser && (
                                            <p className="text-sm text-slate-500">
                                                Reported user: <span className="font-medium">{report.reportedUser.username}</span>
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Posts Tab */}
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {posts.map(post => (
                                <div key={post._id} className="glass-card rounded-2xl p-4">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={`http://localhost:5001${post.imageUrl}`}
                                            alt="Post"
                                            className="w-20 h-20 object-cover rounded-xl"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 truncate">
                                                {post.author?.username || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">{post.caption}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {post.likes?.length || 0} likes • {post.comments?.length || 0} comments
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;

