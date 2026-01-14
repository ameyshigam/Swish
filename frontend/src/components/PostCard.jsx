import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send, Flag, X, Share2, Trash2, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getServerUrl } from '../utils/url';

const PostCard = ({ post, compact = false, overlay = false }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(post.likes?.some(id => id === user?.id || id.toString?.() === user?.id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeAnimation, setLikeAnimation] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLike = async () => {
        try {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
            if (!isLiked) {
                setLikeAnimation(true);
                setTimeout(() => setLikeAnimation(false), 500);
            }
            await axios.put(`/posts/${post._id}/like`);
        } catch {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
        }
    };

    const handleBookmark = async () => {
        try {
            setIsBookmarked(!isBookmarked);
            await axios.put(`/posts/${post._id}/bookmark`);
        } catch {
            setIsBookmarked(!isBookmarked);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await axios.post(`/posts/${post._id}/comment`, { text: newComment });
            setComments([...comments, res.data]);
            setNewComment('');
        } catch (error) {
            console.error("Comment failed", error);
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
        return getServerUrl(url);
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

    const renderCaption = () => {
        if (!post.caption) return null;
        return <p className="text-sm text-foreground/90">{post.caption}</p>;
    };

    // Overlay Mode (Trending Posts)
    if (overlay) {
        return (
            <>
                <div
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-border/50"
                    onClick={() => setIsExpanded(true)}
                >
                    <img
                        src={imgSrc}
                        onError={handleImageError}
                        alt="Post"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300" />

                    {/* Top Stats (Hidden by default, show on hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                            <Heart size={12} className="text-white fill-white" />
                            <span className="text-[10px] font-bold text-white">{likeCount}</span>
                        </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 overflow-hidden flex-shrink-0">
                                {post.author?.profileData?.avatarUrl ? (
                                    <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold">
                                        {post.author?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="text-white font-bold text-sm drop-shadow-md truncate">{post.author?.username}</span>
                        </div>

                        {/* Caption Preview */}
                        {post.caption && (
                            <p className="text-white/80 text-xs line-clamp-1 mb-2 font-medium">{post.caption}</p>
                        )}
                    </div>
                </div>
                {/* Re-use the existing expanded modal logic */}
                {isExpanded && (
                    <div
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6 cursor-default"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="absolute top-3 right-3 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={28} strokeWidth={1.5} />
                        </button>

                        {/* Modal Content - Instagram Layout */}
                        <div
                            className="relative w-full max-w-5xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row bg-card rounded-xl md:rounded-sm overflow-hidden shadow-2xl border border-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image Section */}
                            <div className="relative h-[45%] md:h-auto md:flex-1 flex items-center justify-center bg-muted/20">
                                <img
                                    src={imgSrc}
                                    alt="Post"
                                    className="w-full h-full object-contain select-none"
                                    onDoubleClick={handleLike}
                                    draggable={false}
                                />
                            </div>

                            {/* Details Sidebar */}
                            <div className="h-[55%] md:h-full w-full md:w-[350px] lg:w-[400px] flex flex-col bg-card md:border-l border-border">
                                {/* Author Header */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                    <Link to={`/user/${authorId}`} onClick={() => setIsExpanded(false)}>
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[2px] flex-shrink-0">
                                            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                {post.author?.profileData?.avatarUrl ? (
                                                    <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-muted-foreground text-xs font-semibold">{post.author?.username?.[0]?.toUpperCase() || 'U'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/user/${authorId}`} onClick={() => setIsExpanded(false)} className="hover:underline">
                                            <p className="text-foreground font-semibold text-sm">{post.author?.username}</p>
                                        </Link>
                                    </div>
                                </div>

                                {/* Scrollable Content: Caption + Comments */}
                                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                                    {/* Caption Section - Styled as first comment */}
                                    {post.caption && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[1.5px] flex-shrink-0 self-start">
                                                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                    {post.author?.profileData?.avatarUrl ? (
                                                        <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-muted-foreground text-[10px] font-bold">{post.author?.username?.[0]?.toUpperCase() || 'U'}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm leading-relaxed">
                                                    <span className="font-bold text-foreground mr-2">{post.author?.username}</span>
                                                    <span className="text-foreground">{post.caption}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{formatTime(post.createdAt)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments List */}
                                    {comments.map((c, i) => (
                                        <div key={c._id || i} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 self-start overflow-hidden">
                                                {c.userAvatar ? (
                                                    <img src={getImageUrl(c.userAvatar)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-muted-foreground text-xs font-semibold">{c.username?.[0]?.toUpperCase() || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm leading-relaxed">
                                                    <span className="font-semibold text-foreground mr-2">{c.username}</span>
                                                    <span className="text-foreground/90">{c.text}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="border-t border-border px-4 py-3">
                                    <div className="flex items-center gap-4 mb-2">
                                        <button onClick={handleLike}><Heart size={24} className={isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'} /></button>
                                        <MessageCircle size={24} className="text-foreground" />
                                    </div>
                                    <p className="text-foreground font-semibold text-sm">{likeCount} likes</p>
                                </div>

                                {/* Comment Input - Instagram Style */}
                                <div className="border-t border-border px-4 py-3">
                                    <form onSubmit={handleComment} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                                            {user?.profileData?.avatarUrl ? (
                                                <img src={getImageUrl(user.profileData.avatarUrl)} alt="Me" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-bold">
                                                    {user?.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className={`text-sm font-semibold ${newComment.trim() ? 'text-primary hover:text-primary/80' : 'text-primary/50'}`}
                                        >
                                            Post
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="group glass-card overflow-hidden h-full flex flex-col">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center">
                {!imgError ? (
                    <img
                        src={imgSrc}
                        onError={handleImageError}
                        alt="Post"
                        className="w-full h-full object-cover cursor-pointer"
                        onDoubleClick={handleLike}
                        onClick={() => setIsExpanded(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                        <span className="text-2xl font-semibold text-foreground">Post</span>
                    </div>
                )}
                {/* Like Animation */}
                {likeAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Heart className="text-red-500 drop-shadow-lg animate-ping" size={60} fill="currentColor" />
                    </div>
                )}

                {/* Menu */}
                <div className="absolute top-2 right-2">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full bg-background/60 text-foreground hover:bg-background/80 backdrop-blur-sm transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border py-1 min-w-[120px] z-10">
                            {(user?.id === authorId || user?.role === 'admin') && (
                                <button onClick={handleDelete} className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                    <Trash2 size={12} /> Delete
                                </button>
                            )}
                            <button onClick={() => { setShowReportModal(true); setShowMenu(false); }} className="w-full px-3 py-1.5 text-left text-xs text-foreground/80 hover:bg-accent hover:text-accent-foreground flex items-center gap-2">
                                <Flag size={12} /> Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {!compact && (
                <div className="p-3 flex-1 flex flex-col bg-card">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <button onClick={handleLike} className="group flex items-center gap-1">
                                <Heart size={22} className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            </button>
                            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 group">
                                <MessageCircle size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>
                            <button className="flex items-center gap-1 group">
                                <Share2 size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>
                        </div>
                        <button onClick={handleBookmark}>
                            <Bookmark size={22} className={`transition-colors ${isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground hover:text-foreground'}`} />
                        </button>
                    </div>

                    {/* Likes Count */}
                    <div className="mt-3">
                        <span className="text-xs font-bold text-foreground">{likeCount} likes</span>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                        <div className="mt-2 flex items-start gap-2">
                            <Link to={`/user/${authorId}`} className="flex-shrink-0">
                                {post.author?.profileData?.avatarUrl ? (
                                    <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <span className="text-muted-foreground text-[10px] font-bold">{post.author?.username?.[0]?.toUpperCase() || 'U'}</span>
                                    </div>
                                )}
                            </Link>
                            <div>
                                <Link to={`/user/${authorId}`} className="hover:underline">
                                    <p className="text-sm font-bold text-foreground truncate">{post.author?.username}</p>
                                    <p className="text-[10px] text-muted-foreground">{formatTime(post.createdAt)}</p>
                                </Link>
                                <div className="mt-1">
                                    {renderCaption()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments Preview */}
                    {!showComments && comments.length > 0 && (
                        <button onClick={() => setShowComments(true)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                            View all {comments.length} comments
                        </button>
                    )}

                    {/* Inline Comment Input */}
                    <form onSubmit={handleComment} className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {user?.profileData?.avatarUrl ? (
                                <img src={getImageUrl(user.profileData.avatarUrl)} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-bold">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        {newComment.trim() && (
                            <button
                                type="submit"
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Post
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-popover text-popover-foreground rounded-xl w-full max-w-sm p-6 space-y-4 shadow-xl border border-border">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-foreground">Report</h3>
                            <button onClick={() => setShowReportModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-1.5 mb-4">
                            {['spam', 'harassment', 'inappropriate', 'other'].map(reason => (
                                <label key={reason} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-sm ${reportReason === reason ? 'border-primary bg-primary/10' : 'border-input'}`}>
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`w-3 h-3 rounded-full border-2 ${reportReason === reason ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                                    <span className="capitalize text-foreground">{reason}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 border border-input rounded-lg text-muted-foreground text-sm font-medium hover:bg-muted">Cancel</button>
                            <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-red-600">Report</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expanded View Modal - Instagram Style */}
            {isExpanded && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6"
                    onClick={() => setIsExpanded(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-3 right-3 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={28} strokeWidth={1.5} />
                    </button>

                    {/* Modal Content - Instagram Layout */}
                    <div
                        className="relative w-full max-w-5xl h-[95vh] md:h-[85vh] flex flex-col md:flex-row bg-card rounded-none md:rounded-sm overflow-hidden shadow-2xl border border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Section - takes most space on desktop */}
                        <div className="relative flex-1 flex items-center justify-center bg-muted/20">
                            {!imgError ? (
                                <img
                                    src={imgSrc}
                                    alt="Post"
                                    className="w-full h-full object-contain select-none"
                                    onDoubleClick={handleLike}
                                    draggable={false}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                                    <span className="text-4xl">📷</span>
                                    <span className="text-sm mt-2">Image unavailable</span>
                                </div>
                            )}
                            {/* Like Animation */}
                            {likeAnimation && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Heart className="text-white drop-shadow-2xl animate-ping" size={100} fill="white" />
                                </div>
                            )}
                        </div>

                        {/* Details Sidebar - Instagram style */}
                        <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col bg-card md:border-l border-border max-h-[45vh] md:max-h-full">
                            {/* Author Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                <Link to={`/user/${authorId}`} onClick={() => setIsExpanded(false)}>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[2px] flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {post.author?.profileData?.avatarUrl ? (
                                                <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-muted-foreground text-xs font-semibold">{post.author?.username?.[0]?.toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/user/${authorId}`} onClick={() => setIsExpanded(false)} className="hover:underline">
                                        <p className="text-foreground font-semibold text-sm">{post.author?.username}</p>
                                    </Link>
                                </div>
                                <button className="p-2 text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            {/* Comments Section - Scrollable */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                                {/* Author's Caption as first item */}
                                {post.caption && (
                                    <div className="flex gap-3">
                                        <Link to={`/user/${authorId}`} onClick={() => setIsExpanded(false)}>
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {post.author?.profileData?.avatarUrl ? (
                                                    <img src={getImageUrl(post.author.profileData.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-muted-foreground text-xs font-semibold">{post.author?.username?.[0]?.toUpperCase() || 'U'}</span>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <Link to={`/user/${authorId}`} onClick={() => setIsExpanded(false)} className="font-semibold text-foreground hover:underline">
                                                    {post.author?.username}
                                                </Link>{' '}
                                                <span className="text-foreground/90">{post.caption}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">{formatTime(post.createdAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Comments */}
                                {comments.map((c, i) => (
                                    <div key={c._id || i} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                            <span className="text-muted-foreground text-xs font-semibold">{c.username?.[0]?.toUpperCase() || 'U'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-semibold text-foreground">{c.username}</span>{' '}
                                                <span className="text-foreground/90">{c.text}</span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground">2h</span>
                                                <button className="text-xs text-muted-foreground font-semibold hover:text-foreground">Reply</button>
                                            </div>
                                        </div>
                                        <button className="text-muted-foreground hover:text-foreground">
                                            <Heart size={12} />
                                        </button>
                                    </div>
                                ))}

                                {comments.length === 0 && !post.caption && (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <p className="text-sm font-semibold text-foreground">No comments yet.</p>
                                        <p className="text-sm mt-1">Start the conversation.</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions Section */}
                            <div className="border-t border-border px-4 py-3">
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <button onClick={handleLike} className="hover:opacity-70 transition-opacity">
                                            <Heart size={24} className={isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'} />
                                        </button>
                                        <button className="hover:opacity-70 transition-opacity">
                                            <MessageCircle size={24} className="text-foreground" />
                                        </button>
                                        <button className="hover:opacity-70 transition-opacity">
                                            <Share2 size={24} className="text-foreground" />
                                        </button>
                                    </div>
                                    <button onClick={handleBookmark} className="hover:opacity-70 transition-opacity">
                                        <Bookmark size={24} className={isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-foreground'} />
                                    </button>
                                </div>

                                {/* Likes Count */}
                                <p className="text-foreground font-semibold text-sm mb-1">{likeCount.toLocaleString()} likes</p>
                                <p className="text-muted-foreground text-xs uppercase">{formatTime(post.createdAt)}</p>
                            </div>

                            {/* Comment Input - Instagram Style */}
                            <div className="border-t border-border px-4 py-3">
                                <form onSubmit={handleComment} className="flex items-center gap-3">
                                    <button type="button" className="text-2xl">😊</button>
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className={`text-sm font-semibold ${newComment.trim() ? 'text-primary hover:text-primary/80' : 'text-primary/50'}`}
                                    >
                                        Post
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;



