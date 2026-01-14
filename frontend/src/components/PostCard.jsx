import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send, Flag, X, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PostCard = ({ post, compact = false }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(post.likes?.some(id => id === user?.id || id.toString?.() === user?.id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeAnimation, setLikeAnimation] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const handleLike = async () => {
        try {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
            if (!isLiked) {
                setLikeAnimation(true);
                setTimeout(() => setLikeAnimation(false), 500);
            }
            await axios.put(`/posts/${post._id}/like`);
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
        }
    };

    const handleBookmark = async () => {
        try {
            setIsBookmarked(!isBookmarked);
            await axios.put(`/posts/${post._id}/bookmark`);
        } catch (error) {
            setIsBookmarked(!isBookmarked);
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

    const handleReport = async () => {
        if (!reportReason) return;
        try {
            await axios.post('/admin/reports', {
                type: 'post',
                postId: post._id,
                reason: reportReason,
                description: ''
            });
            setShowReportModal(false);
            setReportReason('');
        } catch (error) {
            console.error("Report failed", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/posts/${post._id}`);
            window.location.reload();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString();
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('https')) return url;

        // Normalize slashes for Windows compatibility
        const normalizedUrl = url.replace(/\\/g, '/');
        // Remove double slashes if any (e.g. //uploads)
        const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;

        return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${cleanUrl}`;
    };

    const [imgSrc, setImgSrc] = useState(getImageUrl(post.imageUrl));
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgSrc(getImageUrl(post.imageUrl));
        setImgError(false);
    }, [post.imageUrl]);

    const handleImageError = () => {
        console.error(`Failed to load image: ${imgSrc}`);
        setImgError(true);
    };

    const authorId = post.author?._id || post.authorId;

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                {!imgError ? (
                    <img
                        src={imgSrc}
                        onError={handleImageError}
                        alt="Post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onDoubleClick={handleLike}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                        <span className="text-2xl font-semibold text-slate-600">Post</span>
                    </div>
                )}
                {/* Like Animation */}
                {likeAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Heart className="text-red-500 drop-shadow-lg animate-ping" size={60} fill="currentColor" />
                    </div>
                )}
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={handleLike} className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-white/60 text-slate-900 hover:bg-slate-200'}`}>
                                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => setShowComments(!showComments)} className="p-2 rounded-full bg-white/60 text-slate-900 hover:bg-slate-200 backdrop-blur-sm transition-colors">
                                <MessageCircle size={16} />
                            </button>
                        </div>
                        <button onClick={handleBookmark} className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isBookmarked ? 'bg-amber-500 text-white' : 'bg-white/60 text-slate-900 hover:bg-slate-200'}`}>
                            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
                {/* Menu */}
                <div className="absolute top-2 right-2">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full bg-white/60 text-slate-900 hover:bg-slate-200 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px] z-10">
                            {(user?.id === authorId || user?.role === 'admin') && (
                                <button onClick={handleDelete} className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-900/20 flex items-center gap-2">
                                    <Trash2 size={12} /> Delete
                                </button>
                            )}
                            <button onClick={() => { setShowReportModal(true); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                <Flag size={12} /> Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {!compact && (
                <div className="p-3 flex-1 flex flex-col bg-white">
                    {/* Author */}
                    <Link to={`/user/${authorId}`} className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
                            {post.author?.profileData?.avatarUrl ? (
                                <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-900 text-xs font-bold">{post.author?.username?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">{post.author?.username}</p>
                            <p className="text-[10px] text-slate-400">{formatTime(post.createdAt)}</p>
                        </div>
                    </Link>

                    {/* Caption */}
                    <p className="text-xs text-slate-600 line-clamp-2 flex-1 mb-2">{post.caption}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-auto pt-2 text-[10px] font-medium text-slate-500">
                        <span>{likeCount} likes</span>
                        <span>{comments.length} comments</span>
                    </div>
                </div>
            )}

            {/* Comments Panel */}
            {showComments && !compact && (
                <div className="border-t border-slate-200 p-3 bg-white">
                    <div className="space-y-2 mb-2 max-h-24 overflow-y-auto">
                        {comments.length === 0 ? (
                            <p className="text-[10px] text-slate-500 text-center py-1">No comments</p>
                        ) : (
                            comments.slice(-3).map((c, i) => (
                                <p key={c._id || i} className="text-[10px]">
                                    <span className="font-semibold text-slate-900">{c.username}</span>{' '}
                                    <span className="text-slate-400">{c.text}</span>
                                </p>
                            ))
                        )}
                    </div>
                    <form onSubmit={handleComment} className="flex gap-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Comment..."
                            className="flex-1 bg-slate-50 rounded-lg px-2 py-1.5 text-[10px] border border-slate-200 focus:outline-none focus:border-slate-300 text-slate-900 placeholder:text-slate-400"
                        />
                        <button type="submit" disabled={!newComment.trim()} className="p-1.5 bg-slate-100 text-slate-900 rounded-lg disabled:opacity-40 hover:bg-slate-200">
                            <Send size={10} />
                        </button>
                    </form>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-xs w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-900">Report</h3>
                            <button onClick={() => setShowReportModal(false)} className="p-1 text-slate-500 hover:text-slate-700">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-1.5 mb-4">
                            {['spam', 'harassment', 'inappropriate', 'other'].map(reason => (
                                <label key={reason} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-sm ${reportReason === reason ? 'border-slate-300 bg-slate-100' : 'border-slate-200'}`}>
                                    <input type="radio" name="reason" value={reason} checked={reportReason === reason} onChange={(e) => setReportReason(e.target.value)} className="sr-only" />
                                    <div className={`w-3 h-3 rounded-full border-2 ${reportReason === reason ? 'border-slate-900 bg-slate-900' : 'border-slate-400'}`} />
                                    <span className="capitalize text-slate-700">{reason}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-100">Cancel</button>
                            <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-red-600">Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;



