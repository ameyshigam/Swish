import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Share2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(post.likes.includes(user?.id));
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const handleLike = async () => {
        try {
            // Optimistic UI update
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

            await axios.put(`/posts/${post._id}/like`);
        } catch (error) {
            // Revert on error
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
            console.error("Like failed", error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            const res = await axios.post(`/posts/${post._id}/comment`, { text: newComment });
            setComments([...comments, res.data]);
            setNewComment('');
        } catch (error) {
            console.error("Comment failed", error);
        } finally {
            setCommentLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-3xl p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white border-2 border-transparent overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 bg-slate-100">
                                {post.author?.username?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{post.author?.username}</h4>
                        <span className="text-xs text-slate-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100">
                <img
                    src={`http://localhost:5001${post.imageUrl}`}
                    alt="Post content"
                    className="w-full h-auto object-cover max-h-[500px]"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                    >
                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                        <span className="font-medium">{likeCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 transition-colors ${showComments ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
                    >
                        <MessageCircle size={24} />
                        <span className="font-medium">{comments.length}</span>
                    </button>
                </div>

                <button className="text-slate-400 hover:text-blue-500 transition-colors">
                    <Share2 size={22} />
                </button>
            </div>

            {/* Caption */}
            <div className="px-1 mb-2">
                <p className="text-slate-700 leading-relaxed">
                    <span className="font-bold mr-2">{post.author?.username}</span>
                    {post.caption}
                </p>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                        {comments.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-2">No comments yet.</p>
                        ) : (
                            comments.map((comment, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="font-bold text-sm text-slate-800">{comment.username}</div>
                                    <div className="text-sm text-slate-600">{comment.text}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleComment} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all pr-10"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || commentLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:opacity-50 p-1"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
