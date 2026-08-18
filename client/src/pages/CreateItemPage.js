import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemAPI } from '../services/itemAPI';

const CATEGORIES = ['Books', 'Tools', 'Sports', 'Electronics', 'Furniture', 'Gadgets', 'Other'];
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor'];

export function CreateItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    condition: 'Good',
    requiresDeposit: false,
    depositAmount: 0,
    maxBorrowDays: 14,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side validation (mirrors backend limits)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG, GIF, or WEBP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.title || !formData.category) {
      setError('Title and category are required');
      return;
    }

    setLoading(true);

    try {
      // Build FormData so the photo file can travel alongside the other fields
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('requiresDeposit', formData.requiresDeposit);
      data.append('depositAmount', formData.depositAmount);
      data.append('maxBorrowDays', formData.maxBorrowDays);
      if (photoFile) {
        data.append('photo', photoFile);
      }

      await itemAPI.createItem(data);
      navigate('/my-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[FDE68A]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-fade-in">List a New Item</h1>
        <p className="text-gray-600 mb-8">Share something with your community!</p>

        {/* User Location Info */}
        <div className="card p-4 mb-8 bg-black border border-black">
          <p className="text-sm text-gray-200">
            📍 <strong className="text-accent-500">Location:</strong> Your item will be listed at your profile location
            ({user?.location?.[1]?.toFixed(4)}, {user?.location?.[0]?.toFixed(4)})
          </p>
          <p className="text-xs text-gray-400 mt-2">
            To change your location, update it in your profile settings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-8 space-y-6 animate-slide-up">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Introduction to Python"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field h-24 resize-none"
              placeholder="Tell borrowers about the item's condition, any quirks, what's included, etc..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="input-field"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>

            {!photoPreview ? (
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-accent-500 hover:bg-accent-50 transition-colors duration-200"
              >
                <span className="text-3xl mb-2">📷</span>
                <span className="text-sm text-gray-600 font-medium">Tap to take a photo or choose from gallery</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, or WEBP — up to 5MB</span>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Max Borrow Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Borrow Days
            </label>
            <input
              type="number"
              name="maxBorrowDays"
              min="1"
              max="90"
              value={formData.maxBorrowDays}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          {/* Deposit */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="requiresDeposit"
                id="requiresDeposit"
                checked={formData.requiresDeposit}
                onChange={handleInputChange}
                className="h-4 w-4 text-accent-500 rounded focus:ring-accent-500"
              />
              <label htmlFor="requiresDeposit" className="ml-3 text-sm font-medium text-gray-700">
                Require a deposit to borrow
              </label>
            </div>

            {formData.requiresDeposit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount ($)
                </label>
                <input
                  type="number"
                  name="depositAmount"
                  min="0"
                  step="0.01"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Creating...' : 'List Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-items')}
              className="flex-1 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}