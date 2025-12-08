import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Settings, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import Button from '../components/Button';

const Profile = () => {
    const { user, logout } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const res = await axios.get('/posts/me');
                setPosts(res.data);
            } catch (error) {
                console.error("Failed to fetch user posts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, []);

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>

                <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 pt-10">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1 shadow-xl">
                        <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </div>

                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-bold text-slate-800">{user?.username}</h1>
                        <p className="text-slate-500 font-medium">@{user?.email?.split('@')[0]}</p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} /> Campus User
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={16} /> Joined 2024
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button className="py-2.5 px-6" onClick={() => alert('Edit Profile clicked')}>
                            Edit Profile
                        </Button>
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mt-8 pt-8 border-t border-slate-100/50">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">{posts.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">0</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">0</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Following</div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-700 px-2">Recent Posts</h3>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No posts yet.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
