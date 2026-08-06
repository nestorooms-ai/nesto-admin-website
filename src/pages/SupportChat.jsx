import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import { io } from 'socket.io-client';
import { useAdminStore } from '../store';
import { Search, Send, Loader2, MessageSquare, ArrowLeft, RotateCw, X } from 'lucide-react';

const SupportChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { token } = useAdminStore();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6000';

  // Helper to format image URLs using Cloudfront CDN if applicable
  const getImageUrl = (imgUrl) => {
    const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || 'https://d2g6n77yp3nhfw.cloudfront.net';
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      if (imgUrl.includes('.amazonaws.com/')) {
        try {
          const urlObj = new URL(imgUrl);
          const pathname = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
          return `${CDN_BASE_URL}/${pathname}`;
        } catch (e) {
          console.error('Failed to parse S3 URL:', e);
        }
      }
      return imgUrl;
    }
    return `${CDN_BASE_URL}/${imgUrl}`;
  };

  // Helper to play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
      audio.volume = 0.4;
      audio.play().catch(() => {}); // Catch browser autoplay block policy
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  // Time format helper for last message
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Format message bubble timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Grouping messages by date
  const getDateSeparator = (dateStr1, dateStr2) => {
    if (!dateStr1) return null;
    const d1 = new Date(dateStr1);
    const dateKey1 = d1.toDateString();

    if (dateStr2) {
      const d2 = new Date(dateStr2);
      const dateKey2 = d2.toDateString();
      if (dateKey1 === dateKey2) return null;
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateKey1 === today) return 'Today';
    if (dateKey1 === yesterday) return 'Yesterday';
    return d1.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch active conversations
  const fetchConversations = async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/api/admin/support-chats');
      setConversations(res.data.data);
    } catch (err) {
      console.error('Error fetching support conversations:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch single chat messages
  const fetchMessages = async (userId) => {
    setLoadingChat(true);
    try {
      const res = await api.get(`/api/admin/support-chats/messages?userId=${userId}`);
      setMessages(res.data.data);

      // Clear unread indicator locally
      setConversations(prev =>
        prev.map(c => c.userId === userId ? { ...c, unread: 0 } : c)
      );
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();

    // Setup Socket connection
    socketRef.current = io(API_BASE_URL, {
      auth: {
        token: `Bearer ${token}`,
        from: 'admin'
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected to server');
      socketRef.current.emit('join-admin');
    });

    // Handle incoming messages
    socketRef.current.on('messageSentToHost', (payload) => {
      const incomingMsg = payload.data;
      if (incomingMsg.propertyId === "6a665e119d426673548176bc") {
        if (incomingMsg.messageFrom !== 'Host') {
          playNotificationSound();
        }

        // If it's for the selected user, add it to messages list
        setSelectedUser(currentUser => {
          if (currentUser && currentUser.userId === incomingMsg.userId) {
            setMessages(prev => {
              if (prev.some(m => m._id === incomingMsg._id)) return prev;
              return [...prev, incomingMsg];
            });
          }
          return currentUser;
        });

        // Refresh conversations list to update preview and unread badges
        fetchConversations();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('messageSentToHost');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle conversation click
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user.userId);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const res = await api.post('/api/admin/support-chats/send', {
        userId: selectedUser.userId,
        messageText
      });
      // Append sent message locally
      setMessages(prev => [...prev, res.data.data]);

      // Update preview in left panel
      setConversations(prev =>
        prev.map(c => c.userId === selectedUser.userId ? { ...c, lastMessage: messageText, createdAt: new Date().toISOString() } : c)
      );
    } catch (err) {
      alert('Failed to send support message.');
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-[#242f47] overflow-hidden glass-card relative">
      {/* Left panel - Conversation list */}
      <div className={`w-full md:w-80 border-r border-[#242f47] flex flex-col bg-[#151c2c]/40 ${
        selectedUser ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-[#242f47] space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Support Channels</h3>
            <button
              onClick={fetchConversations}
              disabled={loadingList}
              className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-[#242f47]/50 disabled:opacity-50"
              title="Refresh Chats"
            >
              <RotateCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151c2c] border border-[#242f47] rounded-lg py-2 pl-9 pr-4 text-white text-xs focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#242f47]/40">
          {loadingList && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((c) => {
              const isActive = selectedUser?.userId === c.userId;
              return (
                <div
                  key={c.userId}
                  onClick={() => handleSelectUser(c)}
                  className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-[#151c2c]/60 transition duration-150 ${
                    isActive ? 'bg-[#242f47]/70 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <img
                    src={getImageUrl(c.userProfilePic) || "https://avatar.iran.liara.run/public"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-[#242f47]"
                    onError={(e) => { e.target.src = "https://avatar.iran.liara.run/public" }}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-white truncate">{c.userName || 'Unknown User'}</p>
                      <span className="text-[10px] text-gray-500">
                        {c.createdAt ? formatMessageTime(c.createdAt) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{c.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full ${
                        c.userType === 'HOST'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {c.userType}
                      </span>
                      {c.unread > 0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold animate-pulse">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-gray-500">
              No conversations active.
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Chat messages */}
      <div className={`flex-1 flex flex-col justify-between bg-[#151c2c]/10 ${
        selectedUser ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedUser ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-[#242f47] bg-[#151c2c]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-2 -ml-2 mr-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#242f47]/50 transition"
                  title="Back to Chats"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={getImageUrl(selectedUser.userProfilePic) || "https://avatar.iran.liara.run/public"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border border-[#242f47]"
                  onError={(e) => { e.target.src = "https://avatar.iran.liara.run/public" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{selectedUser.userName}</p>
                  <p className="text-[10px] text-gray-400 truncate">Support Chat Session ({selectedUser.userType})</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                selectedUser.userType === 'HOST'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {selectedUser.userType}
              </span>
            </div>

            {/* Message streams */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((m, idx) => {
                  const isAdminMsg = m.messageFrom === 'Host' || m.messageFrom === 'host';
                  const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
                  const dateSeparator = getDateSeparator(m.createdAt, prevMsg?.createdAt);

                  return (
                    <React.Fragment key={m._id || idx}>
                      {dateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                            {dateSeparator}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 text-sm rounded-2xl ${
                            isAdminMsg
                              ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-500/20'
                              : 'bg-[#1a2333]/90 text-gray-200 border border-[#2d3a54]/50 rounded-tl-none'
                          }`}>
                            {m.type === 'TEXT' && <p className="break-words whitespace-pre-wrap">{m.messageText}</p>}
                            {m.type === 'IMAGE' && m.content && m.content.length > 0 && (
                              <div className="grid gap-2 grid-cols-1 mt-1">
                                {m.content.map((imgUrl, imgIdx) => (
                                  <img
                                    key={imgIdx}
                                    src={getImageUrl(imgUrl)}
                                    alt="Chat Attachment"
                                    onClick={() => setSelectedImage(getImageUrl(imgUrl))}
                                    className="max-w-[12rem] max-h-[12rem] rounded-xl object-cover cursor-pointer hover:opacity-90 transition border border-[#242f47] bg-[#151c2c]"
                                    onError={(e) => { e.target.src = "https://avatar.iran.liara.run/public" }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-500 font-semibold mt-1 px-1 flex items-center gap-1">
                            {formatTimestamp(m.createdAt)}
                            {isAdminMsg && (
                              <span className="text-[10px]" title={m.read ? "Read" : "Delivered"}>
                                {m.read ? (
                                  <span className="text-indigo-400">✓✓</span>
                                ) : (
                                  <span className="text-gray-600">✓</span>
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm space-y-2">
                  <MessageSquare className="w-10 h-10 text-gray-600 animate-pulse" />
                  <p>Send a message to begin support conversation.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input reply form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#242f47] bg-[#151c2c]/30 flex gap-3 shrink-0">
              <input
                type="text"
                placeholder="Type your reply here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#151c2c] border border-[#242f47] rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-600" />
            <div className="text-center">
              <h3 className="text-white font-semibold mb-1">No Active Chat Session Selected</h3>
              <p className="text-xs text-gray-400">Select a user channel on the left to start live real-time support.</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal Preview Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-[#1a2333]/80 hover:bg-[#1a2333] text-white rounded-full transition"
            title="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Preview Attachment"
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-[#242f47]"
          />
        </div>
      )}
    </div>
  );
};

export default SupportChat;
