import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { messageAPI } from '../services/messageAPI';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 4000; // Re-fetch messages every 4 seconds while the chat is open

export function ChatModal({ request, otherPartyName, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await messageAPI.getMessages(request._id);
      setMessages(res.data.messages);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [request._id]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError('');
    try {
      await messageAPI.sendMessage(request._id, text.trim());
      setText('');
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl max-w-md w-full h-[70vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-black text-white">
          <div>
            <p className="font-bold">{otherPartyName}</p>
            <p className="text-xs text-gray-400">{request.itemId?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="spinner"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">
              No messages yet. Say hello and arrange the pickup!
            </p>
          ) : (
            messages.map((msg) => {
              // Robust comparison: senderId may arrive as a populated object
              // ({_id, name}) or occasionally just a plain string ID —
              // normalize both sides to plain strings before comparing.
              const senderIdValue =
                typeof msg.senderId === 'object' && msg.senderId !== null
                  ? msg.senderId._id
                  : msg.senderId;
              const currentUserId = user?._id || user?.id;
              const isMine = String(senderIdValue) === String(currentUserId);
              const senderName =
                typeof msg.senderId === 'object' && msg.senderId !== null
                  ? msg.senderId.name
                  : isMine
                  ? 'You'
                  : otherPartyName;

              return (
                <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-400 mb-1 px-1">
                    {isMine ? 'You' : senderName}
                  </span>
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-accent-500 text-black rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-100">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-10 h-10 flex items-center justify-center bg-accent-500 text-black rounded-full hover:bg-accent-400 transition-colors duration-200 disabled:opacity-40"
          >
            ➤
          </button>
        </form>
      </motion.div>
    </div>
  );
}