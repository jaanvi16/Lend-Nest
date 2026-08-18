import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistance, getImageUrl } from '../utils/helpers';

const MotionLink = motion(Link);

export function ItemCard({ item, showDistance = true, showActions = false, onEdit = null, onDelete = null }) {
  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete();
    }
  };

  return (
    <MotionLink
      to={`/item/${item._id}`}
      className="block"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card overflow-hidden h-full flex flex-col cursor-pointer group hover:shadow-2xl">
        {/* Image */}
        <div className="relative w-full h-60 bg-gray-100 overflow-hidden">
          {item.photoUrl ? (
            <img
              src={getImageUrl(item.photoUrl)}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {/* Category Badge — floating top-left */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 bg-black/90 backdrop-blur-sm text-accent-500 rounded-full text-xs font-semibold">
              {item.category}
            </span>
          </div>

          {/* Availability Badge — floating top-right */}
          <div className="absolute top-3 right-3">
            {item.isAvailable ? (
              <span className="badge-available shadow-sm">Available</span>
            ) : (
              <span className="badge-unavailable shadow-sm">Unavailable</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title — clean, bold, single line */}
          <h3 className="text-lg font-bold text-gray-900 truncate mb-1.5">
            {item.title}
          </h3>

          {/* Distance — small pin icon, prominent-ish but not competing with the value line */}
          {showDistance && item.distanceInKm && (
            <p className="flex items-center gap-1 text-sm text-gray-700 font-medium mb-3">
              <span className="text-accent-600">📍</span>
              {formatDistance(item.distanceInMeters)} away
            </p>
          )}

          {/* Prominent "value" line — borrow terms, styled like a price would be */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-extrabold text-gray-900">
              Up to {item.maxBorrowDays} days
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-sm text-gray-600">{item.condition}</span>
          </div>

          {/* Owner + rating — subtle, muted */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {item.lenderId?.name}
            </p>
            {item.lenderId?.averageRating > 0 && (
              <p className="text-xs text-gray-500">
                ⭐ {item.lenderId?.averageRating.toFixed(1)}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit();
                }}
                className="flex-1 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-2 bg-white border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </MotionLink>
  );
}