import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Settings, MapPin, Calendar, Loader2, Edit2, Grid, BookOpen, Link as LinkIcon, Users, Image, LogOut } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    const getServerUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${path}`;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    axios.get(`/users/${user.id}`),
                    axios.get('/posts/me')
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchProfile();
        }
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Profile Card - Spans 8 columns */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                        {/* Cover */}
                        <div className="h-36 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                        </div>

                        <div className="px-6 pb-6">
                            {/* Avatar & Actions */}
                            <div className="flex justify-between items-end -mt-14 mb-4 relative z-10">
                                <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl">
                                    {profile?.profileData?.avatarUrl ? (
                                        <img
                                            src={getServerUrl(profile.profileData.avatarUrl)}
                                            alt={user?.username}
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-3xl font-bold text-white">
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to="/profile/edit"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Edit Profile
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900">{user?.username}</h1>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${user?.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                        user?.role === 'Faculty' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user?.role}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm">@{user?.email?.split('@')[0]}</p>
                            </div>

                            {profile?.profileData?.bio && (
                                <p className="text-slate-700 mb-4 leading-relaxed">{profile.profileData.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                {profile?.profileData?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} /> {profile.profileData.location}
                                    </span>
                                )}
                                {profile?.profileData?.website && (
                                    <a href={profile.profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                                        <LinkIcon size={14} /> Portfolio
                                    </a>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} /> Joined {formatDate(profile?.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Right Column */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Posts Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Image size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{posts.length}</div>
                            <div className="text-sm text-slate-500">Posts</div>
                        </div>
                    </div>

                    {/* Followers Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Users size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{profile?.followerCount || 0}</div>
                            <div className="text-sm text-slate-500">Followers</div>
                        </div>
                    </div>

                    {/* Following Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Users size={22} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{profile?.followingCount || 0}</div>
                            <div className="text-sm text-slate-500">Following</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex gap-1">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'posts' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Grid size={16} />
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'about' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <BookOpen size={16} />
                    About
                </button>
            </div>

            {/* Content */}
            {activeTab === 'posts' ? (
                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Grid size={36} className="text-slate-300" />
                            </div>
                            <p className="text-slate-700 font-semibold mb-1">No posts yet</p>
                            <p className="text-slate-400 text-sm mb-6">Share your first moment with your campus!</p>
                            <Link
                                to="/create"
                                className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Create Post
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {posts.map(post => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bio Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={16} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{profile?.profileData?.bio || 'No bio added yet'}</p>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={16} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                        </div>
                        <p className="text-slate-700">{profile?.profileData?.location || 'Not specified'}</p>
                    </div>

                    {/* Website Card */}
                    {profile?.profileData?.website && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <LinkIcon size={16} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Website</span>
                            </div>
                            <a href={profile.profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                {profile.profileData.website}
                            </a>
                        </div>
                    )}

                    {/* Joined Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</span>
                        </div>
                        <p className="text-slate-700">{formatDate(profile?.createdAt)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;



