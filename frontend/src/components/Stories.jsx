import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORY_DURATION = 5000; // 5 seconds per story

const Stories = () => {
    const { user } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingStory, setViewingStory] = useState(null); // The user group currently being viewed
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const progressInterval = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await axios.get('/stories');
            // Group by user
            const grouped = res.data.reduce((acc, story) => {
                const userId = story.userId;
                if (!acc[userId]) {
                    const user = story.user || { _id: userId, username: 'Unknown' };
                    acc[userId] = { user, stories: [] };
                }
                acc[userId].stories.push(story);
                return acc;
            }, {});
            setStories(Object.values(grouped));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        try {
            setUploading(true);
            await axios.post('/stories', formData);
            setUploading(false);
            fetchStories(); // Refresh
        } catch (err) {
            console.error(err);
            setUploading(false);
        }
    };

    // Navigation Logic
    const nextStory = useCallback(() => {
        if (!viewingStory) return;

        if (currentStoryIndex < viewingStory.stories.length - 1) {
            // Next story in same group
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            // Next user group
            const currentGroupIndex = stories.findIndex(g => g.user._id === viewingStory.user._id);
            if (currentGroupIndex < stories.length - 1) {
                setViewingStory(stories[currentGroupIndex + 1]);
                setCurrentStoryIndex(0);
                setProgress(0);
            } else {
                // Close viewer if no more stories
                closeViewer();
            }
        }
    }, [currentStoryIndex, viewingStory, stories]);

    const prevStory = useCallback(() => {
        if (!viewingStory) return;

        if (currentStoryIndex > 0) {
            // Previous story in same group
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else {
            // Previous user group
            const currentGroupIndex = stories.findIndex(g => g.user._id === viewingStory.user._id);
            if (currentGroupIndex > 0) {
                const prevGroup = stories[currentGroupIndex - 1];
                setViewingStory(prevGroup);
                setCurrentStoryIndex(prevGroup.stories.length - 1); // Start from last story of prev user
                setProgress(0);
            } else {
                // Restart current story or close? Let's just reset
                setCurrentStoryIndex(0);
                setProgress(0);
            }
        }
    }, [currentStoryIndex, viewingStory, stories]);

    const closeViewer = () => {
        setViewingStory(null);
        setCurrentStoryIndex(0);
        setProgress(0);
    };

    // Timer Logic
    useEffect(() => {
        if (!viewingStory) return;

        const currentStory = viewingStory.stories[currentStoryIndex];
        const isVideo = currentStory?.type === 'video';

        if (isVideo && videoRef.current) {
            // Let video events handle progress
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = (elapsed / STORY_DURATION) * 100;

            if (newProgress >= 100) {
                clearInterval(interval);
                nextStory();
            } else {
                setProgress(newProgress);
            }
        }, 50);

        progressInterval.current = interval;

        return () => clearInterval(interval);
    }, [viewingStory, currentStoryIndex, nextStory]);

    const [deleteConfirmation, setDeleteConfirmation] = useState(null); // Story ID to delete

    // ... (rest of code)

    const handleDeleteClick = (e, storyId) => {
        e.stopPropagation();
        setDeleteConfirmation(storyId);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        const storyId = deleteConfirmation;

        try {
            await axios.delete(`/stories/${storyId}`);

            // If it's the last story in the group, close or move
            if (viewingStory.stories.length === 1) {
                closeViewer();
                fetchStories();
            } else {
                // Remove locally
                const updatedStories = viewingStory.stories.filter(s => s._id !== storyId);
                setViewingStory(prev => ({ ...prev, stories: updatedStories }));
                // Adjust index if needed
                if (currentStoryIndex >= updatedStories.length) {
                    setCurrentStoryIndex(updatedStories.length - 1);
                }
                // Refresh main list
                fetchStories();
            }
        } catch (err) {
            console.error("Failed to delete story", err);
        } finally {
            setDeleteConfirmation(null);
        }
    };

    const cancelDelete = (e) => {
        if (e) e.stopPropagation();
        setDeleteConfirmation(null);
    };

    // Helper for media URL
    const getMediaUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const currentStory = viewingStory?.stories[currentStoryIndex];

    return (
        <div className="bg-transparent mb-6 overflow-x-auto">
            <div className="flex gap-4 pb-2">
                {/* Add Story Button - Hidden file input handled by label */}
                <div className="flex flex-col items-center min-w-[64px] flex-shrink-0">
                    <label className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors relative">
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
                        {uploading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-slate-400 rounded-full border-t-transparent"></div>
                        ) : (
                            <Plus size={24} className="text-slate-400" />
                        )}
                    </label>
                    <span className="text-xs mt-2 text-slate-400 font-medium text-center">Add Story</span>
                </div>

                {/* Story List */}
                {stories.map((group) => (
                    <div
                        key={group.user._id}
                        className="flex flex-col items-center min-w-[64px] cursor-pointer flex-shrink-0"
                        onClick={() => {
                            setViewingStory(group);
                            setCurrentStoryIndex(0);
                            setProgress(0);
                        }}
                    >
                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 flex-shrink-0">
                            {group.user.profileData?.avatarUrl ? (
                                <img
                                    src={getMediaUrl(group.user.profileData.avatarUrl)}
                                    alt={group.user.username}
                                    className="w-full h-full rounded-full object-cover border-2 border-[#03060a]"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-200 border-2 border-slate-200 flex items-center justify-center text-slate-900 font-semibold text-sm">
                                    {group.user.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <span className="text-xs mt-2 text-slate-500 font-medium truncate w-16 text-center">{group.user.username}</span>
                    </div>
                ))}
            </div>

            {/* Instagram-style Viewer Modal */}
            {viewingStory && currentStory && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={closeViewer}
                        className="absolute top-4 right-4 z-30 p-2 bg-black/60 text-white hover:bg-black/70 rounded-full"
                        aria-label="Close story viewer"
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation Buttons (Desktop) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prevStory(); }}
                        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-2 rounded-full shadow z-30"
                        aria-label="Previous story"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextStory(); }}
                        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-2 rounded-full shadow z-30"
                        aria-label="Next story"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Story Container */}
                    <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-xl overflow-hidden bg-white shadow-lg flex flex-col">

                        {/* Progress Bars */}
                        <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
                            {viewingStory.stories.map((story, idx) => (
                                <div key={story._id} className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-slate-900 transition-all duration-100 ease-linear"
                                        style={{
                                            width: idx < currentStoryIndex ? '100%' :
                                                idx === currentStoryIndex ? `${progress}%` : '0%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* User Header */}
                        <div className="absolute top-4 left-0 right-0 z-20 px-4 pt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {viewingStory.user.profileData?.avatarUrl ? (
                                    <img
                                        src={getMediaUrl(viewingStory.user.profileData.avatarUrl)}
                                        className="w-8 h-8 rounded-full border border-slate-200"
                                        alt={viewingStory.user.username}
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-900 font-semibold text-xs">
                                        {viewingStory.user.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className="text-slate-900 font-semibold text-sm">{viewingStory.user.username}</span>
                                <span className="text-slate-500 text-xs">
                                    {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Delete Button for Owner */}
                            {user?.id === viewingStory.user._id && (
                                <button
                                    onClick={(e) => handleDeleteClick(e, currentStory._id)}
                                    className="p-2 text-slate-700 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        {/* Delete Confirmation Modal */}
                        {deleteConfirmation && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                        <Trash2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Delete Story?</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Are you sure you want to delete this story? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={cancelDelete}
                                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-900 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Display */}
                        <div className="flex-1 relative flex items-center justify-center bg-slate-50" onClick={(e) => {
                            // Tap left/right for navigation
                            const width = e.currentTarget.clientWidth;
                            const x = e.nativeEvent.offsetX;
                            if (x < width / 3) prevStory();
                            else nextStory();
                        }}>
                            {currentStory.type === 'video' ? (
                                <video
                                    ref={videoRef}
                                    src={getMediaUrl(currentStory.mediaUrl)}
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    playsInline
                                    onEnded={nextStory}
                                    onTimeUpdate={(e) => {
                                        const p = (e.target.currentTime / e.target.duration) * 100;
                                        setProgress(p);
                                    }}
                                />
                            ) : (
                                <img
                                    src={getMediaUrl(currentStory.mediaUrl)}
                                    className="w-full h-full object-contain"
                                    alt="Story"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;