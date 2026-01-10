import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CreateStory = () => {
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileType, setFileType] = useState(null);

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setFileType(selected.type.startsWith('video') ? 'video' : 'image');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        try {
            setLoading(true);
            await axios.post('/stories', formData);
            success('Story added successfully!');
            setLoading(false);
            // Small delay to ensure toast is seen and state settles
            setTimeout(() => navigate('/'), 800);
        } catch (err) {
            console.error(err);
            toastError('Failed to add story. Please try again.');
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
        setFileType(null);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add to Story</h1>
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {!preview ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Gallery Option */}
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors group relative cursor-pointer">
                            <input
                                type="file"
                                id="gallery-upload"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileSelect}
                                accept="image/*,video/*"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ImageIcon size={32} className="text-blue-500 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Gallery</p>
                                    <p className="text-xs text-slate-500">Upload photos or videos</p>
                                </div>
                            </div>
                        </div>

                        {/* Camera Option */}
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors group relative cursor-pointer">
                            <input
                                type="file"
                                id="camera-upload"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileSelect}
                                accept="image/*,video/*"
                                capture="environment"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-purple-50 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Camera size={32} className="text-purple-500 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Camera</p>
                                    <p className="text-xs text-slate-500">Take a photo or video</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative aspect-[9/16] max-h-[60vh] mx-auto bg-black rounded-xl overflow-hidden group">
                            {fileType === 'video' ? (
                                <video 
                                    src={preview} 
                                    controls 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="w-full h-full object-contain"
                                />
                            )}
                            <button
                                onClick={clearSelection}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={clearSelection}
                                className="flex-1 py-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        Share to Story
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateStory;
