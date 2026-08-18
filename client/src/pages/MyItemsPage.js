import { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { itemAPI } from '../services/itemAPI';

export function MyItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadItems = async () => {
    try {
      const response = await itemAPI.getMyItems();
      setItems(response.data.items);
    } catch (err) {
      setError('Failed to load your items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await itemAPI.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[FDE68A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900">My Items</h1>
          <Link
            to="/create-item"
            className="px-6 py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
          >
            + List New Item
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                showDistance={false}
                showActions={true}
                onEdit={() => {
                  // Edit functionality will come later
                  alert('Edit feature coming soon');
                }}
                onDelete={() => handleDelete(item._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card p-8 animate-slide-up">
            <p className="text-xl text-gray-600 mb-4">You haven't listed any items yet.</p>
            <Link
              to="/create-item"
              className="inline-block px-6 py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
            >
              List Your First Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}