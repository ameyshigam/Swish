import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Trash2, Ban, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminFaculties = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { success, error } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/auth/users');
            // Filter only faculties (role normalized to 'Faculty')
            const faculties = res.data.filter(u => u.role === 'Faculty');
            setUsers(faculties);
        } catch (err) {
            console.error(err);
            error('Failed to load faculties');
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId) => {
        try {
            const res = await axios.put(`/admin/users/${userId}/ban`);
            setUsers(users.map(u => u._id === userId ? { ...u, isBanned: res.data.isBanned } : u));
            success(res.data.message);
        } catch (err) {
            console.error(err);
            error('Failed to update ban status');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await axios.delete(`/auth/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            success('User deleted');
        } catch (err) {
            console.error(err);
            error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
                        <Search className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Manage Faculties</h1>
                        <p className="text-sm text-muted-foreground">{filteredUsers.length} faculties found</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search faculties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground w-64"
                    />
                </div>
            </div>

            <div className="neo-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 font-semibold text-muted-foreground">User</th>
                            <th className="p-4 font-semibold text-muted-foreground">Email</th>
                            <th className="p-4 font-semibold text-muted-foreground">Status</th>
                            <th className="p-4 font-semibold text-muted-foreground">Joined</th>
                            <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-muted-foreground">No faculties found</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                                                {user.profileData?.avatarUrl ? (
                                                    <img src={user.profileData.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-medium text-foreground">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground">{user.email}</td>
                                    <td className="p-4">
                                        {user.isBanned ? (
                                            <span className="px-2.5 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-semibold">Banned</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-muted-foreground text-sm">
                                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/user/${user._id}`}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="View Profile"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleBan(user._id)}
                                                className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
                                                title={user.isBanned ? "Unban User" : "Ban User"}
                                            >
                                                <Ban size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFaculties;