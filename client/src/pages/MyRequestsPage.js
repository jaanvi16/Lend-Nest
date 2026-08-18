import { useState, useEffect } from 'react';
import { requestAPI } from '../services/requestAPI';
import { ratingAPI } from '../services/ratingAPI';
import { formatDate } from '../utils/helpers';
import { ChatModal } from '../components/ChatModal';
import { messageAPI } from '../services/messageAPI';

// Status badge colors kept distinct/semantic (not tied to brand colors) so status is instantly readable
const statusColors = {
  requested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  borrowed: 'bg-purple-100 text-purple-800',
  returned: 'bg-green-100 text-green-800',
  completed: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-gray-200 text-gray-500',
};

// Messaging opens up once a request is approved (so they can arrange the handoff)
// and stays available all the way through completion.
const MESSAGEABLE_STATUSES = ['approved', 'borrowed', 'returned', 'completed'];

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-3xl leading-none transition-transform hover:scale-110"
        >
          {n <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}

export function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Track which requests the current user has already rated: { [requestId]: true/false }
  const [ratedStatus, setRatedStatus] = useState({});

  // Rating modal state
  const [ratingModalRequest, setRatingModalRequest] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  // Chat modal state
  const [chatRequest, setChatRequest] = useState(null);
  const [chatOtherPartyName, setChatOtherPartyName] = useState('');

  // Unread message counts per request: { [requestId]: count }
  const [unreadCounts, setUnreadCounts] = useState({});

  const loadUnreadCounts = async () => {
    try {
      const res = await messageAPI.getUnreadCountsByRequest();
      setUnreadCounts(res.data.counts);
    } catch (err) {
      console.error('Failed to load unread counts', err);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const [sentRes, receivedRes] = await Promise.all([
        requestAPI.getSentRequests(),
        requestAPI.getReceivedRequests(),
      ]);
      setSentRequests(sentRes.data.requests);
      setReceivedRequests(receivedRes.data.requests);

      // Check rating status for every request that's eligible to be rated
      const all = [...sentRes.data.requests, ...receivedRes.data.requests];
      const eligible = all.filter((r) => ['returned', 'completed'].includes(r.status));
      const statusEntries = await Promise.all(
        eligible.map(async (r) => {
          try {
            const res = await ratingAPI.getRatingStatus(r._id);
            return [r._id, res.data.hasRated];
          } catch {
            return [r._id, false];
          }
        })
      );
      setRatedStatus(Object.fromEntries(statusEntries));
    } catch (err) {
      setError('Failed to load your requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    loadUnreadCounts();
    const unreadPoll = setInterval(loadUnreadCounts, 10000); // refresh badges every 10s
    return () => clearInterval(unreadPoll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRespond = async (requestId, action) => {
    setActionLoadingId(requestId);
    try {
      await requestAPI.respondToRequest(requestId, action);
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    setActionLoadingId(requestId);
    try {
      await requestAPI.updateStatus(requestId, status);
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Cancel this request?')) return;
    setActionLoadingId(requestId);
    try {
      await requestAPI.cancelRequest(requestId);
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRatingModal = (req) => {
    setRatingModalRequest(req);
    setRatingScore(0);
    setRatingReview('');
    setRatingError('');
    setRatingSuccess(false);
  };

  const closeRatingModal = () => {
    setRatingModalRequest(null);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setRatingError('');

    if (ratingScore < 1) {
      setRatingError('Please select a star rating');
      return;
    }

    setRatingSubmitting(true);
    try {
      await ratingAPI.createRating({
        borrowRequestId: ratingModalRequest._id,
        score: ratingScore,
        review: ratingReview,
      });
      setRatingSuccess(true);
      setRatedStatus((prev) => ({ ...prev, [ratingModalRequest._id]: true }));
      await loadRequests();
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const openChat = (req, otherPartyName) => {
    setChatRequest(req);
    setChatOtherPartyName(otherPartyName);
  };

  const closeChat = () => {
    setChatRequest(null);
    loadUnreadCounts(); // opening the chat marks its messages read, so refresh badges
  };

  const renderRequestCard = (req, isReceived) => {
    const otherParty = isReceived ? req.borrowerId : req.lenderId;
    const isActing = actionLoadingId === req._id;
    const canRate = ['returned', 'completed'].includes(req.status) && !ratedStatus[req._id];
    const canMessage = MESSAGEABLE_STATUSES.includes(req.status);

    return (
      <div key={req._id} className="card p-5 flex flex-col sm:flex-row gap-4 animate-fade-in">
        {/* Item photo */}
        <div className="sm:w-24 sm:h-24 w-full h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {req.itemId?.photoUrl ? (
            <img src={req.itemId.photoUrl} alt={req.itemId.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-900">{req.itemId?.title || 'Item'}</h3>
              <p className="text-sm text-gray-600">
                {isReceived ? 'Requested by' : 'From'}: {otherParty?.name}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[req.status]}`}>
              {req.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {formatDate(req.requestedStartDate)} → {formatDate(req.requestedEndDate)}
          </p>

          {req.message && (
            <p className="text-sm text-gray-700 mt-2 italic">"{req.message}"</p>
          )}

          {req.status === 'rejected' && req.rejectionReason && (
            <p className="text-sm text-red-600 mt-2">Reason: {req.rejectionReason}</p>
          )}

          {['returned', 'completed'].includes(req.status) && ratedStatus[req._id] && (
            <p className="text-sm text-accent-600 font-medium mt-2">✓ You rated this exchange</p>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {/* Lender actions on a pending request */}
            {isReceived && req.status === 'requested' && (
              <>
                <button
                  disabled={isActing}
                  onClick={() => handleRespond(req._id, 'approve')}
                  className="px-4 py-1.5 bg-accent-500 text-black rounded-lg text-sm font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Approve
                </button>
                <button
                  disabled={isActing}
                  onClick={() => handleRespond(req._id, 'reject')}
                  className="px-4 py-1.5 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Reject
                </button>
              </>
            )}

            {/* Message the other party */}
            {canMessage && (
              <button
                onClick={() => openChat(req, otherParty?.name)}
                className="relative px-4 py-1.5 bg-white border border-gray-300 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                💬 Message
                {unreadCounts[req._id] > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full">
                    {unreadCounts[req._id]}
                  </span>
                )}
              </button>
            )}

            {/* Lender marks as handed over */}
            {isReceived && req.status === 'approved' && (
              <button
                disabled={isActing}
                onClick={() => handleStatusUpdate(req._id, 'borrowed')}
                className="px-4 py-1.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                Mark as Handed Over
              </button>
            )}

            {/* Either party marks as returned */}
            {req.status === 'borrowed' && (
              <button
                disabled={isActing}
                onClick={() => handleStatusUpdate(req._id, 'returned')}
                className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                Mark as Returned
              </button>
            )}

            {/* Rate the other party */}
            {canRate && (
              <button
                onClick={() => openRatingModal(req)}
                className="px-4 py-1.5 bg-accent-500 text-black rounded-lg text-sm font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
              >
                ⭐ Rate {otherParty?.name}
              </button>
            )}

            {/* Borrower can cancel before it's active */}
            {!isReceived && ['requested', 'approved'].includes(req.status) && (
              <button
                disabled={isActing}
                onClick={() => handleCancel(req._id)}
                className="px-4 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[FDE68A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 animate-fade-in">My Requests</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'received'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'sent'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        )}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

        {!loading && (
          <div className="space-y-4">
            {activeTab === 'received' &&
              (receivedRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No requests received yet.</p>
              ) : (
                receivedRequests.map((req) => renderRequestCard(req, true))
              ))}

            {activeTab === 'sent' &&
              (sentRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">You haven't requested anything yet.</p>
              ) : (
                sentRequests.map((req) => renderRequestCard(req, false))
              ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModalRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-slide-up">
            <button
              onClick={closeRatingModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl leading-none transition-colors"
            >
              ×
            </button>

            {ratingSuccess ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Thanks for rating!</h2>
                <p className="text-gray-600 mb-6">Your feedback helps build trust in the community.</p>
                <button
                  onClick={closeRatingModal}
                  className="px-6 py-2 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Rate this exchange</h2>
                <p className="text-gray-600 mb-4">{ratingModalRequest.itemId?.title}</p>

                {ratingError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {ratingError}
                  </div>
                )}

                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <div className="flex flex-col items-center py-2">
                    <StarPicker value={ratingScore} onChange={setRatingScore} />
                    <p className="text-sm text-gray-500 mt-2">
                      {ratingScore > 0 ? `${ratingScore} out of 5` : 'Tap a star to rate'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Review (optional)
                    </label>
                    <textarea
                      value={ratingReview}
                      onChange={(e) => setRatingReview(e.target.value)}
                      rows={3}
                      placeholder="Share how the exchange went..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ratingSubmitting}
                    className="w-full py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatRequest && (
        <ChatModal
          request={chatRequest}
          otherPartyName={chatOtherPartyName}
          onClose={closeChat}
        />
      )}
    </div>
  );
}