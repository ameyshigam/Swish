import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import { ImagePlus, X } from 'lucide-react';

const CreatePost = () => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;

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
            navigate('/');
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">Create New Post</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Area */}
                    <div className="relative">
                        {preview ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-sm group">
                                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImage(null); setPreview(null); }}
                                    className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                        <ImagePlus size={24} />
                                    </div>
                                    <p className="mb-2 text-sm text-slate-500 font-medium">Click to upload photo</p>
                                    <p className="text-xs text-slate-400">PNG, JPG or GIF (MAX. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    {/* Caption Input */}
                    <div>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none resize-none transition-all h-32"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-3 text-lg"
                        disabled={loading || !image}
                    >
                        {loading ? 'Posting...' : 'Share Post'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
