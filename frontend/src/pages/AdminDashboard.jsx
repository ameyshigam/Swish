import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Shield, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Failed to load users. Are you an admin?");
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

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="glass rounded-3xl p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Shield className="text-blue-400" /> Admin Dashboard
                    </h1>
                    <p className="text-slate-400">Manage users and content stability.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{users.length}</div>
                        <div className="text-sm text-slate-500">Total Users</div>
                    </div>
                </div>
                {/* Placeholders for other stats */}
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">Stable</div>
                        <div className="text-sm text-slate-500">System Status</div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">User Management</h2>
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
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">{u.username}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {/* Assuming ID has timestamp, or simplify */}
                                        {u._id.substring(0, 8)}...
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
        </div>
    );
};

export default AdminDashboard;
