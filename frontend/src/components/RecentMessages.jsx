import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const RecentMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                // Fetch friends list which serves as the message feed for now
                // Ideally this should be an endpoint for "recent conversations"
                const res = await axios.get('/messages/friends');
                setConversations(res.data || []);
            } catch (err) {
                console.error("Failed to load message feed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-4 h-full animate-pulse">
                <div className="h-6 w-1/2 bg-muted rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted"></div>
                            <div className="h-4 w-3/4 bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={20} className="text-foreground" />
                <h3 className="font-bold text-foreground">Messages</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                        No messages yet
                    </div>
                ) : (
                    conversations.map(friend => (
                        <div
                            key={friend._id}
                            onClick={() => navigate('/messages')}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl cursor-pointer transition-colors"
                        >
                            <div className="relative">
                                <img
                                    src={friend.profileData?.avatarUrl || "https://ui-avatars.com/api/?name=" + friend.username}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                    alt={friend.username}
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#0b1720]"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-sm truncate">{friend.username}</h4>
                                <p className="text-xs text-muted-foreground truncate">
                                    Click to chat
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentMessages;

