import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { Camera, ArrowLeft, Loader2, CheckCircle, MapPin, Link as LinkIcon, User, FileText, Sparkles } from 'lucide-react';

const EditProfile = () => {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        website: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/users/${user.id}`);
                const profileData = res.data.profileData || {};
                setFormData({
                    bio: profileData.bio || '',
                    location: profileData.location || '',
                    website: profileData.website || ''
                });
                if (profileData.avatarUrl) {
                    setAvatarPreview(getMediaUrl(profileData.avatarUrl));
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };

        if (user?.id) {
            fetchProfile();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        setAvatarLoading(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            await axios.put('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatarFile(null);
        } catch (error) {
            console.error("Failed to upload avatar", error);
            toast.error('Failed to upload avatar');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            if (avatarFile) {
                await handleAvatarUpload();
            }
            await axios.put('/users/profile', formData);
            setSuccess(true);
            if (refreshUser) {
                await refreshUser();
            }
            setTimeout(() => {
                navigate('/profile');
            }, 1200);
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Profile</span>
            </button>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Avatar Panel */}
                <div className="lg:col-span-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-6">
                        {/* Avatar */}
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden bg-slate-100 shadow-lg">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-5xl font-bold text-white">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                <div className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={28} />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">{user?.username}</h3>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                                {user?.role}
                            </span>
                        </div>

                        {avatarFile && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-sm text-emerald-700">
                                <Sparkles size={16} />
                                New photo selected
                            </div>
                        )}

                        {/* Tips */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tips</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></span>
                                    Use a clear profile photo
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></span>
                                    Write a short, engaging bio
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 flex-shrink-0"></span>
                                    Add your location for networking
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form Panel */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
                            <p className="text-slate-500 mt-1">Update your personal information</p>
                        </div>

                        {success && (
                            <div className="mx-6 mt-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle size={20} />
                                <span className="font-medium">Profile updated successfully!</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Bio */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900">Bio</label>
                                        <span className="text-xs text-slate-500">Tell others about yourself</span>
                                    </div>
                                </div>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Write a short bio..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:outline-none resize-none transition-all h-28 text-slate-700 placeholder:text-slate-400"
                                    maxLength={150}
                                />
                                <div className="flex justify-end mt-2">
                                    <span className={`text-xs font-medium ${formData.bio.length > 140 ? 'text-amber-500' : 'text-slate-400'}`}>
                                        {formData.bio.length}/150
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900">Location</label>
                                        <span className="text-xs text-slate-500">Where are you based?</span>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Engineering Building, Room 204"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:outline-none transition-all text-slate-700 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Website */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                                        <LinkIcon size={18} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900">Website / Portfolio</label>
                                        <span className="text-xs text-slate-500">Share your work or personal site</span>
                                    </div>
                                </div>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://yourportfolio.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:outline-none transition-all text-slate-700 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;

