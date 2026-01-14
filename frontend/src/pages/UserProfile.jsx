import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import PostCard from '../components/PostCard';
import Button from '../components/Button';
import { Settings, MapPin, Calendar, UserPlus, UserMinus, ArrowLeft, Loader2, Image, Users, Grid, BookOpen, Link as LinkIcon, Lock, Clock } from 'lucide-react';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const { success, error: toastError } = useToast();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    const getServerUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${path}`;
    };

    const isOwnProfile = !id || id === currentUser?.id;
    const userId = isOwnProfile ? currentUser?.id : id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, postsRes] = await Promise.all([
                    axios.get(`/users/${userId}`),
                    axios.get(`/users/${userId}/posts`)
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const res = await axios.put(`/users/${userId}/follow`);
            const status = res.data.status;

            setProfile(prev => {
                let newIsFollowing = prev.isFollowing;
                let newHasRequested = prev.hasRequested;
                let newFollowerCount = prev.followerCount;

                if (status === 'requested') {
                    newHasRequested = true;
                    newIsFollowing = false;
                } else if (status === 'unfollowed') {
                    newHasRequested = false;
                    newIsFollowing = false;
                    newFollowerCount = Math.max(0, prev.followerCount - 1);
                } else if (status === 'accepted') {
                    newIsFollowing = true;
                    newHasRequested = false;
                    newFollowerCount = prev.followerCount + 1;
                }

                return {
                    ...prev,
                    isFollowing: newIsFollowing,
                    hasRequested: newHasRequested,
                    followerCount: newFollowerCount
                };
            });
        } catch (error) {
            console.error("Failed to toggle follow", error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-xl">
                User not found
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {!isOwnProfile && (
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-2">
                    <ArrowLeft size={18} />
                    <span className="font-medium">Back</span>
                </Link>
            )}

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Profile Card - Spans 8 columns */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        {/* Cover */}
                        <div className="h-36 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                        </div>

                        <div className="px-6 pb-6">
                            {/* Avatar & Actions */}
                            <div className="flex justify-between items-end -mt-14 mb-4 relative z-10">
                                <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl">
                                    {profile.profileData?.avatarUrl ? (
                                        <img
                                            src={getServerUrl(profile.profileData.avatarUrl)}
                                            alt={profile.username}
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                                            {profile.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {isOwnProfile ? (
                                        <>
                                            <Link
                                                to="/profile/edit"
                                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                                            >
                                                Edit Profile
                                            </Link>
                                            <Link to="/settings" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                                <Settings size={20} />
                                            </Link>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleFollow}
                                            disabled={followLoading || (profile.hasRequested && !profile.isFollowing)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors group ${profile.isFollowing
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-600'
                                                    : profile.hasRequested
                                                        ? 'bg-slate-100 text-slate-700'
                                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            {followLoading ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : profile.isFollowing ? (
                                                <>
                                                    <span className="group-hover:hidden flex items-center gap-2"><Users size={16} /> Friends</span>
                                                    <span className="hidden group-hover:flex items-center gap-2"><UserMinus size={16} /> Unfollow</span>
                                                </>
                                            ) : profile.hasRequested ? (
                                                <>
                                                    <Clock size={16} /> Requested
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={16} /> Follow
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900">{profile.username}</h1>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${profile.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                        profile.role === 'Faculty' ? 'bg-amber-100 text-amber-700' :
                                            'bg-emerald-50 text-emerald-700'
                                        }`}>
                                        {profile.role}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">@{profile.email?.split('@')[0]}</p>
                            </div>

                            {profile.profileData?.bio && (
                                <p className="text-slate-700 mb-5 leading-relaxed">{profile.profileData.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                                {profile.profileData?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-slate-400" /> {profile.profileData.location}
                                    </span>
                                )}
                                {profile.profileData?.website && (
                                    <a href={profile.profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                                        <LinkIcon size={16} /> Website
                                    </a>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} className="text-slate-400" /> Joined {formatDate(profile.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Right Column */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Posts Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Image size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{profile.postCount}</div>
                            <div className="text-sm text-slate-500 font-medium">Posts</div>
                        </div>
                    </div>

                    {/* Followers Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Users size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{profile.followerCount}</div>
                            <div className="text-sm text-slate-500 font-medium">Followers</div>
                        </div>
                    </div>

                    {/* Following Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Users size={22} className="text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{profile.followingCount}</div>
                            <div className="text-sm text-slate-500 font-medium">Following</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex gap-1 shadow-sm">
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
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                {isOwnProfile ? (
                                    <Grid size={36} className="text-slate-300" />
                                ) : (
                                    <Lock size={36} className="text-slate-300" />
                                )}
                            </div>
                            <p className="text-slate-700 font-semibold mb-1">
                                {isOwnProfile ? "No posts yet" : "No posts to show"}
                            </p>
                            <p className="text-slate-400 text-sm mb-6">
                                {isOwnProfile ? "Share your first moment with your campus!" : `${profile.username} hasn't posted anything yet.`}
                            </p>
                            {isOwnProfile && (
                                <Link
                                    to="/create"
                                    className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                                >
                                    Create Post
                                </Link>
                            )}
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
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={16} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{profile?.profileData?.bio || 'No bio available'}</p>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={16} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                        </div>
                        <p className="text-slate-700">{profile?.profileData?.location || 'Not specified'}</p>
                    </div>

                    {/* Website Card */}
                    {profile?.profileData?.website && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
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
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</span>
                        </div>
                        <p className="text-slate-700">{formatDate(profile.createdAt)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
