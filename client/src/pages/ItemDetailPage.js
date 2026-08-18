import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemAPI } from '../services/itemAPI';
import { requestAPI } from '../services/requestAPI';
import { useAuth } from '../context/AuthContext';
import { formatDate, getImageUrl } from '../utils/helpers';

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const response = await itemAPI.getItem(id);
        setItem(response.data.item);
      } catch (err) {
        setError('Failed to load item details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const openRequestModal = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRequestError('');
    setRequestSuccess(false);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setRequestError('');

    if (!startDate || !endDate) {
      setRequestError('Please select both a start and end date');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setRequestError('End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      await requestAPI.createRequest({
        itemId: item._id,
        requestedStartDate: startDate,
        requestedEndDate: endDate,
        message,
      });
      setRequestSuccess(true);
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'Item not found'}</p>
          <button
            onClick={() => navigate('/browse')}
            className="px-4 py-2 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const lender = item.lenderId;

  return (
    <div className="min-h-screen bg-[FDE68A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/browse')}
          className="mb-6 px-4 py-2 text-black font-medium hover:text-accent-600 transition-colors"
        >
          ← Back to Browse
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          {/* Image */}
          <div className="card overflow-hidden">
            {item.photoUrl ? (
              <img
                src={getImageUrl(item.photoUrl)}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                <span className="text-6xl">📦</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title & Status */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-black text-accent-500 rounded-full text-sm font-semibold">
                  {item.category}
                </span>
                {item.isAvailable ? (
                  <span className="badge-available">Available</span>
                ) : (
                  <span className="badge-unavailable">Unavailable</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {item.description || 'No description provided'}
              </p>
            </div>

            {/* Item Details */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Item Details</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Condition:</strong> {item.condition}</p>
                <p><strong>Max Borrow Days:</strong> {item.maxBorrowDays}</p>
                {item.requiresDeposit && (
                  <p><strong>Deposit Required:</strong> ${item.depositAmount}</p>
                )}
                <p><strong>Listed on:</strong> {formatDate(item.createdAt)}</p>
              </div>
            </div>

            {/* Lender Info */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About the Lender</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{lender?.name}</h3>
                  <p className="text-gray-600">{lender?.email}</p>
                </div>

                {lender?.bio && (
                  <p className="text-gray-700">{lender.bio}</p>
                )}

                {lender?.averageRating > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-accent-600 font-semibold">
                      ⭐ {lender.averageRating.toFixed(1)} rating
                    </p>
                    <p className="text-sm text-gray-600">
                      ({lender.totalRatings} reviews)
                    </p>
                  </div>
                )}

                {lender?.profilePhoto && (
                  <img
                    src={lender.profilePhoto}
                    alt={lender.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* CTA Button */}
            {item.isAvailable ? (
              <button
                onClick={openRequestModal}
                className="w-full py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200 text-lg"
              >
                Request to Borrow
              </button>
            ) : (
              <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-bold cursor-not-allowed text-lg">
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-slide-up">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl leading-none transition-colors"
            >
              ×
            </button>

            {requestSuccess ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h2>
                <p className="text-gray-600 mb-6">
                  {lender?.name} will review your request and respond soon.
                </p>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    navigate('/my-requests');
                  }}
                  className="px-6 py-2 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
                >
                  View My Requests
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Request to Borrow</h2>
                <p className="text-gray-600 mb-4">{item.title}</p>

                {requestError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {requestError}
                  </div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Let them know why you need it, or any details..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}