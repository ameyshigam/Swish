import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Heart, MessageCircle, UserPlus, Check, Loader2 } from 'lucide-react';

const NotificationIcon = ({ type }) => {
    const styles = {
        like: 'bg-red-500/10 text-red-500',
        comment: 'bg-blue-500/10 text-blue-500',
        follow: 'bg-emerald-500/10 text-emerald-500',
        follow_request: 'bg-purple-500/10 text-purple-500',
        follow_accept: 'bg-emerald-500/10 text-emerald-500',
        default: 'bg-muted text-muted-foreground'
    };

    const icons = {
        like: <Heart size={16} fill="currentColor" />,
        comment: <MessageCircle size={16} />,
        follow: <UserPlus size={16} />,
        follow_request: <UserPlus size={16} />,
        follow_accept: <Check size={16} />,
        default: <Bell size={16} />
    };

    return (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles[type] || styles.default}`}>
            {icons[type] || icons.default}
        </div>
    );
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        const loadAndMarkRead = async () => {
            try {
                // 1. Fetch notifications
                const res = await axios.get('/notifications');
                setNotifications(res.data);

                // 2. Mark all as read automatically if there are unread items
                const hasUnread = res.data.some(n => !n.read);
                if (hasUnread) {
                    await axios.put('/notifications/mark-all-read');
                    // Update local state to show as read
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    // Update global badge count
                    window.dispatchEvent(new Event('notificationsRead'));
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        loadAndMarkRead();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await axios.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            window.dispatchEvent(new Event('notificationsRead'));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        } finally {
            setMarkingAll(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationLink = (notification) => {
        switch (notification.type) {
            case 'like':
            case 'comment':
                return `/post/${notification.postId}`;
            case 'follow':
            case 'follow_request':
            case 'follow_accept':
                return `/user/${notification.senderId}`;
            default:
                return '#';
        }
    };

    const handleAccept = async (e, notification) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.post(`/users/requests/respond`, {
                requesterId: notification.sender._id,
                action: 'accept'
            });

            // Update UI to show "We are friends now"
            setNotifications(prev => prev.map(n =>
                n._id === notification._id
                    ? { ...n, read: true, type: 'follow_accept', message: 'is now your friend!' }
                    : n
            ));
        } catch (error) {
            console.error("Failed to accept", error);
        }
    };

    const handleReject = async (e, notification) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.post(`/users/requests/respond`, {
                requesterId: notification.sender._id,
                action: 'reject'
            });
            setNotifications(prev => prev.filter(n => n._id !== notification._id));
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="neo-card p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <Bell className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
                            <p className="text-muted-foreground text-sm">{notifications.length} notifications</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 rounded-xl transition-colors"
                        >
                            {markingAll ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div className="neo-card p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-primary" size={28} />
                    </div>
                    <p className="text-foreground font-medium mb-1">No notifications yet</p>
                    <p className="text-muted-foreground text-sm">
                        When someone interacts with your posts, you'll see it here
                    </p>
                </div>
            ) : (
                <div className="neo-card overflow-hidden divide-y divide-border mt-4">
                    {notifications.map(notification => (
                        <Link
                            key={notification._id}
                            to={getNotificationLink(notification)}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                            className={`flex items-start gap-4 p-4 transition-colors hover:bg-accent/50 ${!notification.read ? 'bg-primary/5' : ''
                                }`}
                        >
                            {/* Sender Avatar */}
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-sm flex-shrink-0">
                                {notification.sender?.username?.[0]?.toUpperCase() || '?'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <NotificationIcon type={notification.type} />
                                    <p className="text-foreground/80 text-sm">
                                        <span className="font-semibold text-foreground">{notification.sender?.username}</span>
                                        {' '}{notification.message}
                                    </p>
                                </div>
                                {notification.preview && (
                                    <p className="text-muted-foreground text-sm truncate pl-10">
                                        "{notification.preview}"
                                    </p>
                                )}
                                {notification.type === 'follow_request' && (
                                    <div className="flex gap-2 pl-10 mt-2">
                                        <button
                                            onClick={(e) => handleAccept(e, notification)}
                                            className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={(e) => handleReject(e, notification)}
                                            className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-lg hover:bg-accent"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 pl-10">
                                    {formatTime(notification.createdAt)}
                                </p>
                            </div>

                            {/* Unread Indicator */}
                            {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
