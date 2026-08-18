import { useState, useEffect } from 'react';
import { ItemCard } from '../components/ItemCard';
import { itemAPI } from '../services/itemAPI';
import { getCurrentLocation } from '../utils/helpers';

const CATEGORIES = ['All', 'Books', 'Tools', 'Sports', 'Electronics', 'Furniture', 'Gadgets', 'Other'];

export function BrowseItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distance, setDistance] = useState('10000');

  // Get user's location and load items on mount
  useEffect(() => {
    loadItems();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      // Get user's current location
      const { latitude, longitude } = await getCurrentLocation();
      setLocation({ latitude, longitude });

      // Fetch items near user
      const response = await itemAPI.getAllItems(
        latitude,
        longitude,
        distance,
        selectedCategory,
        searchTerm
      );

      setItems(response.data.items);
    } catch (err) {
      setError('Failed to get your location or load items. Please enable geolocation.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search/filter items
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await itemAPI.getAllItems(
        location?.latitude,
        location?.longitude,
        distance,
        selectedCategory,
        searchTerm
      );

      setItems(response.data.items);
    } catch (err) {
      setError('Failed to search items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setLoading(true);

    try {
      const response = await itemAPI.getAllItems(
        location?.latitude,
        location?.longitude,
        distance,
        category,
        searchTerm
      );

      setItems(response.data.items);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDE68A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 animate-fade-in">Browse Items</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Location Info */}
        {location && (
          <div className="mb-6 p-4 bg-black border border-black rounded-lg">
            <p className="text-sm text-white">
              📍 Showing items within <strong className="text-accent-500">{(distance / 1000).toFixed(0)} km</strong> of your location
            </p>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="input-field flex-grow"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
            >
              Search
            </button>
          </div>
        </form>

        {/* Distance Slider */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {(distance / 1000).toFixed(1)} km
          </label>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full accent-yellow-500"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-black text-accent-500 scale-105'
                    : 'bg-white text-gray-800 border border-gray-300 hover:border-black hover:scale-105'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} showDistance={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No items found in your area.</p>
            <p className="text-gray-500">Try increasing the search radius or checking back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}