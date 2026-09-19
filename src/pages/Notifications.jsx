import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Users,
  Home as HomeIcon,
  Globe,
  ExternalLink,
} from 'lucide-react';
import api from '../api';

const EMOJI_PRESETS = ['🎉', '⚡', '🏨', '✈️', '🌴', '🎟️', '💰', '📍', '⭐', '🔥'];

const DEEP_LINK_PRESETS = [
  { label: '🏠 Home Screen', path: '/' },
  { label: '🗺️ Itinerary Hub', path: '/itinerary' },
  { label: '🏰 Jaipur Itinerary', path: '/itinerary/jaipur' },
  { label: '🏖️ Goa Itinerary', path: '/itinerary/goa' },
  { label: '🛌 Search Stays & Rooms', path: '/search-results' },
  { label: '🎁 Deals & Offers', path: '/offers' },
  { label: '👤 Account / Profile', path: '/account' },
];

const IMAGE_PRESETS = [
  { label: '🏨 Luxury Hotel', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
  { label: '🏰 Jaipur Palace', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { label: '🏖️ Goa Resort', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
  { label: '🏔️ Mountain Stay', url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80' },
];

export default function Notifications() {
  // Composer Form States
  const [targetAudience, setTargetAudience] = useState('both'); // 'user' | 'host' | 'both'
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deepLink, setDeepLink] = useState('/');

  // History & Action States
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/api/admin/notifications/history?limit=20');
      if (res.data?.success) {
        setHistory(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notification history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a notification title.' });
      return;
    }
    if (!body.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a notification body message.' });
      return;
    }

    const confirmSend = window.confirm(
      `Are you sure you want to broadcast this push notification to all "${targetAudience.toUpperCase()}" app installs?`
    );
    if (!confirmSend) return;

    try {
      setSending(true);
      setStatusMessage(null);

      const res = await api.post('/api/admin/notifications/broadcast', {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        targetAudience,
        deepLink: deepLink.trim() || '/',
      });

      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: `Notification sent successfully to ${targetAudience.toUpperCase()} apps!`,
        });
        // Reset form
        setTitle('');
        setBody('');
        setImageUrl('');
        setDeepLink('/');
        fetchHistory();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.data?.message || 'Failed to send broadcast.',
        });
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to send broadcast notification.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Delete this broadcast log entry?')) return;
    try {
      await api.delete(`/api/admin/notifications/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Failed to delete notification history:', err);
    }
  };

  const insertEmoji = (emoji) => {
    setTitle((prev) => `${prev} ${emoji}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Bell className="w-6 h-6" />
            </div>
            Custom Push Notifications
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Send rich broadcast push notifications with images & deep links to Android & iOS apps (Zero Login Required).
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loadingHistory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#151c2c] hover:bg-[#242f47] border border-[#242f47] text-gray-300 text-xs font-bold transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-normal opacity-70 hover:opacity-100 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Left Column = Composer Form, Right Column = Smartphone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================
            COMPOSER CARD (7 Cols)
        ======================================================== */}
        <div className="lg:col-span-7 bg-[#151c2c] border border-[#242f47] rounded-3xl p-6 sm:p-7 shadow-xl">
          <form onSubmit={handleSendNotification} className="space-y-6">
            {/* 1. Target Audience Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                1. Target Audience
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetAudience('user')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    targetAudience === 'user'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-[#0b0f19]/60 border-[#242f47] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Users className={`w-5 h-5 ${targetAudience === 'user' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold">User App</span>
                  <span className="text-[10px] opacity-70">Guests & Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('host')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    targetAudience === 'host'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-[#0b0f19]/60 border-[#242f47] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <HomeIcon className={`w-5 h-5 ${targetAudience === 'host' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold">Host App</span>
                  <span className="text-[10px] opacity-70">Property Hosts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('both')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    targetAudience === 'both'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-[#0b0f19]/60 border-[#242f47] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Globe className={`w-5 h-5 ${targetAudience === 'both' ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold">Both Apps</span>
                  <span className="text-[10px] opacity-70">All Mobile Devices</span>
                </button>
              </div>
            </div>

            {/* 2. Notification Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  2. Notification Title <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-gray-500">{title.length}/60</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🎉 Flat 20% Off on Jaipur Homestays!"
                maxLength={80}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#0b0f19] border border-[#242f47] text-white text-sm font-semibold placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />

              {/* Quick Emojis */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-bold text-gray-500">Quick Emojis:</span>
                {EMOJI_PRESETS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => insertEmoji(em)}
                    className="w-7 h-7 rounded-lg bg-[#0b0f19] hover:bg-[#242f47] border border-[#242f47] text-xs flex items-center justify-center transition active:scale-90 cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Notification Message Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  3. Message Body <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-gray-500">{body.length}/200</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Plan your weekend royal getaway in Jaipur. Verified private villas with pool available. Book now!"
                rows={3}
                maxLength={250}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#0b0f19] border border-[#242f47] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            {/* 4. Banner Image URL (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  4. High-Resolution Banner Image URL (Optional)
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold truncate transition cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#0b0f19] text-gray-400 border-[#242f47] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-... (Direct image link for big banner)"
                className="w-full px-4 py-3 rounded-2xl bg-[#0b0f19] border border-[#242f47] text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Tip: Direct image URLs (JPG, PNG, WebP) display as a full expanded banner and thumbnail on Android & iOS devices.
              </p>
            </div>

            {/* 5. Action / Deep Link Route */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                5. On-Click Action / Deep Link Target
              </label>
              
              {/* Presets dropdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {DEEP_LINK_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => setDeepLink(preset.path)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold truncate transition cursor-pointer ${
                      deepLink === preset.path
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#0b0f19] text-gray-400 border-[#242f47] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                placeholder="/itinerary/jaipur or /search-results or custom path"
                className="w-full px-4 py-3 rounded-2xl bg-[#0b0f19] border border-[#242f47] text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Submit / Send Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting via Firebase...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Broadcast Notification Now</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-500 mt-2">
                100% Free Firebase Cloud Messaging • Instant delivery to all active & background devices.
              </p>
            </div>
          </form>
        </div>

        {/* ========================================================
            LIVE SMARTPHONE MOCKUP PREVIEW (5 Cols)
        ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Live Notification Preview
              </span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Lock Screen / Banner
              </span>
            </div>

            {/* Phone Frame */}
            <div className="w-full bg-[#0b0f19] rounded-[40px] border-4 border-[#242f47] p-4 shadow-2xl shadow-black/80 relative overflow-hidden">
              {/* Speaker notch */}
              <div className="w-20 h-4 bg-[#151c2c] rounded-full mx-auto mb-4" />

              {/* Time & Battery Status bar */}
              <div className="flex items-center justify-between text-gray-500 text-[10px] px-3 mb-6 font-mono">
                <span>09:41</span>
                <span>5G • 100%</span>
              </div>

              {/* Lock Screen Notification Card */}
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl transition-all duration-300 animate-fadeIn">
                {/* Header: App Name, Icon, Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-xs">
                      N
                    </div>
                    <span className="text-xs font-bold text-white tracking-tight">Nesto Rooms</span>
                    <span className="text-[10px] text-gray-400">• Just now</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">
                    {targetAudience}
                  </span>
                </div>

                {/* Title & Body */}
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                    {title || '🎉 Special Offer on Your Next Trip!'}
                  </h4>
                  <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                    {body || 'Book verified homestays & custom itineraries with exclusive discounts. Tap to open!'}
                  </p>
                </div>

                {/* Big Picture Banner Preview */}
                {imageUrl && (
                  <div className="mt-2.5 rounded-xl overflow-hidden border border-white/10 bg-slate-800 h-36 relative">
                    <img
                      src={imageUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Deep Link indicator */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="flex items-center gap-1 font-mono text-indigo-300">
                    <ExternalLink className="w-3 h-3" />
                    {deepLink || '/'}
                  </span>
                  <span>Tap to open</span>
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-8 mb-2" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SENT BROADCAST HISTORY LOG (Table)
      ======================================================== */}
      <div className="bg-[#151c2c] border border-[#242f47] rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#242f47]">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Broadcast History & Delivery Logs
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Past notification campaigns sent to Android & iOS devices
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-[#0b0f19] px-3 py-1 rounded-full border border-[#242f47]">
            {history.length} Logs
          </span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0b0f19] text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-[#242f47]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Date / Time</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5">Notification Content</th>
                  <th className="p-3.5">Banner</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242f47]/50">
                {history.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item._id} className="hover:bg-[#1f283d] transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-mono text-gray-400">{dateStr}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            item.targetAudience === 'user'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : item.targetAudience === 'host'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.targetAudience}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.body}</div>
                      </td>
                      <td className="p-3.5">
                        {item.imageUrl ? (
                          <a
                            href={item.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-12 h-8 rounded-lg overflow-hidden border border-[#242f47] hover:scale-105 transition"
                          >
                            <img src={item.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-500">None</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-indigo-300 max-w-[120px] truncate">
                        {item.deepLink || '/'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Sent
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteHistory(item._id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete history entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold">No broadcast notifications sent yet.</p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Compose a message above to send your first custom push notification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
