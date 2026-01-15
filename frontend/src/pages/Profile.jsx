import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Settings, MapPin, Calendar, Loader2, Edit2, Grid, BookOpen, Link as LinkIcon, Users, Image, LogOut } from 'lucide-react';
import { getServerUrl } from '../utils/url';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');


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
                    <div className="glass-panel overflow-hidden">
                        {/* Cover with animated gradient */}
                        <div className="h-40 relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500">
                            {/* Animated gradient blobs */}
                            <div className="absolute inset-0">
                                <div className="absolute top-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -ml-20 -mt-20 animate-pulse"></div>
                                <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl -mr-16 -mb-16 animate-pulse delay-700"></div>
                                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
                            </div>
                            {/* Noise texture overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        </div>

                        <div className="px-6 pb-6">
                            {/* Avatar & Actions */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 mb-4 relative z-10 gap-4">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-1 shadow-2xl shadow-fuchsia-500/30 ring-4 ring-background">
                                    {profile?.profileData?.avatarUrl ? (
                                        <img
                                            src={getServerUrl(profile.profileData.avatarUrl)}
                                            alt={user?.username}
                                            className="w-full h-full rounded-[20px] object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to="/profile/edit"
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-fuchsia-500/30"
                                    >
                                        <Edit2 size={16} />
                                        Edit Profile
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-foreground">{user?.username}</h1>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${user?.role === 'Admin' ? 'bg-purple-500/10 text-purple-500' :
                                        user?.role === 'Faculty' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                        {user?.role}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">@{user?.email?.split('@')[0]}</p>
                            </div>

                            {profile?.profileData?.bio && (
                                <p className="text-foreground/80 mb-4 leading-relaxed">{profile.profileData.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {profile?.profileData?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} /> {profile.profileData.location}
                                    </span>
                                )}
                                {profile?.profileData?.website && (
                                    <a href={profile.profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
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
                    <div className="glass-widget p-5 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Image size={24} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-bold text-foreground">{posts.length}</div>
                            <div className="text-sm text-muted-foreground font-medium">Posts</div>
                        </div>
                    </div>

                    {/* Followers Stat */}
                    <div className="glass-widget p-5 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Users size={24} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-bold text-foreground">{profile?.followerCount || 0}</div>
                            <div className="text-sm text-muted-foreground font-medium">Followers</div>
                        </div>
                    </div>

                    {/* Following Stat */}
                    <div className="glass-widget p-5 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Users size={24} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-bold text-foreground">{profile?.followingCount || 0}</div>
                            <div className="text-sm text-muted-foreground font-medium">Following</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="glass-widget p-1.5 flex gap-1">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'posts' ? 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                >
                    <Grid size={16} />
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'about' ? 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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
                        <div className="neo-card p-12 text-center">
                            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Grid size={36} className="text-muted-foreground" />
                            </div>
                            <p className="text-foreground font-semibold mb-1">No posts yet</p>
                            <p className="text-muted-foreground text-sm mb-6">Share your first moment with your campus!</p>
                            <Link
                                to="/create"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-fuchsia-500/30"
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
                    <div className="glass-widget p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={16} className="text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</span>
                        </div>
                        <p className="text-foreground/80 leading-relaxed">{profile?.profileData?.bio || 'No bio added yet'}</p>
                    </div>

                    {/* Location Card */}
                    <div className="glass-widget p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={16} className="text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</span>
                        </div>
                        <p className="text-foreground/80">{profile?.profileData?.location || 'Not specified'}</p>
                    </div>

                    {/* Website Card */}
                    {profile?.profileData?.website && (
                        <div className="glass-widget p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <LinkIcon size={16} className="text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</span>
                            </div>
                            <a href={profile.profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                {profile.profileData.website}
                            </a>
                        </div>
                    )}

                    {/* Joined Card */}
                    <div className="glass-widget p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</span>
                        </div>
                        <p className="text-foreground/80">{formatDate(profile?.createdAt)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;



