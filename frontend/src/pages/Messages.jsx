import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, ArrowLeft, MoreVertical, Search, Phone, Video } from 'lucide-react';

const Messages = () => {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const scrollRef = useRef();

    const fetchFriends = async () => {
        try {
            const res = await axios.get('/messages/friends');
            setFriends(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (friendId) => {
        try {
            const res = await axios.get(`/messages/${friendId}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        if (selectedFriend) {
            fetchMessages(selectedFriend._id);
            // Polling for new messages every 5 seconds
            const interval = setInterval(() => {
                fetchMessages(selectedFriend._id);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedFriend]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend) return;

        try {
            await axios.post('/messages', {
                recipientId: selectedFriend._id,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages(selectedFriend._id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        setShowChat(true);
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-120px)] neo-card overflow-hidden">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-border flex flex-col bg-card ${showChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-border space-y-3">
                    <h2 className="font-bold text-xl text-foreground">Messages</h2>
                    <div className="relative glass-search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredFriends.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <User size={32} className="mx-auto mb-2 opacity-50" />
                            <p>{searchTerm ? 'No friends found.' : 'No friends to message yet.'}</p>
                            {!searchTerm && <p className="text-xs mt-1">Follow people to start chatting!</p>}
                        </div>
                    ) : (
                        filteredFriends.map(friend => (
                            <div
                                key={friend._id}
                                onClick={() => handleSelectFriend(friend)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-border/50 hover:bg-accent/50 ${selectedFriend?._id === friend._id ? 'bg-accent border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <img
                                        src={friend.profileData?.avatarUrl || "https://ui-avatars.com/api/?name=" + friend.username}
                                        className="w-12 h-12 rounded-full object-cover border border-border"
                                        alt={friend.username}
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${selectedFriend?._id === friend._id ? 'text-foreground' : 'text-foreground/80'}`}>{friend.username}</h3>
                                    <p className="text-xs text-muted-foreground truncate">Click to chat</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-muted/30 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedFriend ? (
                    <>
                        <div className="p-3 md:p-4 bg-card border-b border-border flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowChat(false)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-full">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="relative">
                                    <img
                                        src={selectedFriend.profileData?.avatarUrl || "https://ui-avatars.com/api/?name=" + selectedFriend.username}
                                        className="w-10 h-10 rounded-full object-cover border border-border"
                                        alt={selectedFriend.username}
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground leading-tight">{selectedFriend.username}</h3>
                                    <p className="text-xs text-emerald-500 font-medium">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors">
                                    <Video size={20} />
                                </button>
                                <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Send size={32} className="text-muted-foreground ml-1" />
                                    </div>
                                    <p className="font-medium">No messages yet</p>
                                    <p className="text-sm">Say hello to {selectedFriend.username}!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isThem = msg.senderId === selectedFriend._id;
                                    return (
                                        <div key={idx} className={`flex ${!isThem ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${!isThem
                                                ? 'bg-gradient-to-r from-primary to-purple-600 text-white rounded-br-none'
                                                : 'bg-card border border-border text-foreground rounded-bl-none'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${!isThem ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-card border-t border-border flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 glass-search text-foreground focus:outline-none transition-all placeholder:text-muted-foreground"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="glow-button p-3 disabled:opacity-50 disabled:hover:opacity-50 disabled:transform-none disabled:shadow-none flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/30">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <User size={48} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Your Messages</h3>
                        <p className="text-muted-foreground max-w-xs text-center">
                            Select a friend from the sidebar to start a conversation or continue where you left off.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;