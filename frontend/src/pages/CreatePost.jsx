import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { ImagePlus, X, Loader2, Send, Camera } from 'lucide-react';

const CreatePost = () => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const MAX_CAPTION_LENGTH = 500;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            toast.warning('Please select an image');
            return;
        }

        if (!caption.trim()) {
            toast.warning('Please add a caption');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('caption', caption);

        try {
            await axios.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post shared successfully!');
            navigate('/');
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error(error.response?.data?.message || 'Failed to post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Create Post</h2>
                    <p className="text-sm text-slate-500 mt-1">Share a moment with your campus</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload Area */}
                    <div className="relative">
                        {preview ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('file-input').click()}
                                        className="bg-white text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Camera size={16} />
                                        Change
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setImage(null); setPreview(null); }}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${dragActive
                                        ? 'border-slate-900 bg-slate-50'
                                        : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${dragActive
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        <ImagePlus size={24} />
                                    </div>
                                    <p className="mb-1 text-sm text-slate-700 font-medium">
                                        {dragActive ? 'Drop your image here' : 'Click or drag to upload'}
                                    </p>
                                    <p className="text-xs text-slate-400">PNG, JPG, GIF or WebP (max 5MB)</p>
                                </div>
                                <input
                                    id="file-input"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    {/* Caption Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700">Caption</label>
                            <span className={`text-xs font-medium ${caption.length > MAX_CAPTION_LENGTH * 0.9
                                    ? caption.length > MAX_CAPTION_LENGTH
                                        ? 'text-red-500'
                                        : 'text-amber-500'
                                    : 'text-slate-400'
                                }`}>
                                {caption.length}/{MAX_CAPTION_LENGTH}
                            </span>
                        </div>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
                            placeholder="What's on your mind?"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:outline-none resize-none transition-all h-28 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !image || !caption.trim()}
                        className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Share Post
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;


