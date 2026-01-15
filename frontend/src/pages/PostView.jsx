import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Loader2, ArrowLeft } from 'lucide-react';

const PostView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError("Post not found or deleted");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-destructive font-semibold mb-4">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-10 animate-slide-up-fade">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2.5 text-muted-foreground hover:text-foreground neo-button-ghost rounded-xl font-medium inline-flex items-center gap-2"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {post && <PostCard post={post} />}
        </div>
    );
};

export default PostView;
