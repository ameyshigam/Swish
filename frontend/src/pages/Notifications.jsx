import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Heart, MessageCircle, UserPlus, Check, Loader2 } from 'lucide-react';

const NotificationIcon = ({ type }) => {
    const styles = {
        like: 'bg-red-100 text-red-600',
        comment: 'bg-blue-100 text-blue-600',
        follow: 'bg-emerald-100 text-emerald-600',
        follow_request: 'bg-purple-100 text-purple-600',
        follow_accept: 'bg-emerald-100 text-emerald-600',
        default: 'bg-slate-100 text-slate-600'
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
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Bell className="text-slate-700" size={20} />
                        </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                        {unreadCount > 0 && (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{unreadCount} unread</p>
                        )}
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        disabled={markingAll}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {markingAll ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Check size={16} />
                        )}
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-slate-400" size={28} />
                    </div>
                    <p className="text-slate-600 font-medium mb-1">No notifications yet</p>
                    <p className="text-slate-400 text-sm">
                        When someone interacts with your posts, you'll see it here
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {notifications.map(notification => (
                        <Link
                            key={notification._id}
                            to={getNotificationLink(notification)}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                            className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50 ${!notification.read ? 'bg-slate-50' : ''
                                }`}
                        >
                            {/* Sender Avatar */}
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-semibold text-sm flex-shrink-0">
                                {notification.sender?.username?.[0]?.toUpperCase() || '?'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <NotificationIcon type={notification.type} />
                                    <p className="text-slate-700 text-sm">
                                        <span className="font-semibold text-slate-900">{notification.sender?.username}</span>
                                        {' '}{notification.message}
                                    </p>
                                </div>
                                {notification.preview && (
                                    <p className="text-slate-500 text-sm truncate pl-10">
                                        "{notification.preview}"
                                    </p>
                                )}
                                {notification.type === 'follow_request' && (
                                    <div className="flex gap-2 pl-10 mt-2">
                                        <button 
                                            onClick={(e) => handleAccept(e, notification)}
                                            className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                                        >
                                            Confirm
                                        </button>
                                        <button 
                                            onClick={(e) => handleReject(e, notification)}
                                            className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 mt-1 pl-10">
                                    {formatTime(notification.createdAt)}
                                </p>
                            </div>

                            {/* Unread Indicator */}
                            {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"></div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;

