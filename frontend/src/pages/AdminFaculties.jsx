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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-100">Manage Faculties</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search faculties..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-600">User</th>
                            <th className="p-4 font-semibold text-slate-600">Email</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600">Joined</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">No faculties found</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                                                {user.profileData?.avatarUrl ? (
                                                    <img src={user.profileData.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-medium text-slate-900">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4">
                                        {user.isBanned ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Banned</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                to={`/user/${user._id}`} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Profile"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => handleBan(user._id)}
                                                className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
                                                title={user.isBanned ? "Unban User" : "Ban User"}
                                            >
                                                <Ban size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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