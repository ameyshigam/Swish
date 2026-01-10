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
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 ${showChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
                    <h2 className="font-bold text-xl text-slate-900 dark:text-white">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search friends..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-all text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredFriends.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <User size={32} className="mx-auto mb-2 opacity-50" />
                            <p>{searchTerm ? 'No friends found.' : 'No friends to message yet.'}</p>
                            {!searchTerm && <p className="text-xs mt-1">Follow people to start chatting!</p>}
                        </div>
                    ) : (
                        filteredFriends.map(friend => (
                            <div 
                                key={friend._id}
                                onClick={() => handleSelectFriend(friend)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedFriend?._id === friend._id ? 'bg-slate-50 dark:bg-slate-800 border-l-4 border-l-slate-900 dark:border-l-white' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="relative">
                                    <img 
                                        src={friend.profileData?.avatarUrl || "https://ui-avatars.com/api/?name=" + friend.username} 
                                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                        alt={friend.username}
                                    />
                                    {/* Online indicator placeholder */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${selectedFriend?._id === friend._id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{friend.username}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Click to chat</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedFriend ? (
                    <>
                        <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowChat(false)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="relative">
                                    <img 
                                        src={selectedFriend.profileData?.avatarUrl || "https://ui-avatars.com/api/?name=" + selectedFriend.username} 
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                        alt={selectedFriend.username}
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{selectedFriend.username}</h3>
                                    <p className="text-xs text-emerald-500 font-medium">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <Video size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Send size={32} className="text-slate-400 dark:text-slate-600 ml-1" />
                                    </div>
                                    <p className="font-medium">No messages yet</p>
                                    <p className="text-sm">Say hello to {selectedFriend.username}!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isThem = msg.senderId === selectedFriend._id;
                                    return (
                                        <div key={idx} className={`flex ${!isThem ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                                !isThem 
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-br-none' 
                                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                                            }`}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${!isThem ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-all placeholder:text-slate-400"
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-50 transition-all shadow-md flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <User size={48} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Your Messages</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center">
                            Select a friend from the sidebar to start a conversation or continue where you left off.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;