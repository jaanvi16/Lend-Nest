/**
 * Geolocation utility
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Format distance nicely
 * Input: distance in meters
 * Output: "0.5 km" or "850 m"
 */
export const formatDistance = (distanceMeters) => {
  if (distanceMeters === undefined || distanceMeters === null) return 'N/A';
  
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)} m`;
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate rating display (stars)
 */
export const renderStars = (rating) => {
  const stars = Math.round(rating * 2) / 2; // Round to nearest 0.5
  const fullStars = Math.floor(stars);
  const halfStar = stars % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < fullStars ? '⭐' : halfStar && i === fullStars ? '⭐' : '☆'}
        </span>
      ))}
      <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};

/**
 * Resolve an item/user photo path into a full, loadable URL.
 *
 * Photos uploaded to our own backend are stored as relative paths like
 * "/uploads/item-123.jpg" — these need the backend's origin prefixed,
 * since the React app runs on a different port (3000) than the API (5000).
 *
 * External URLs (e.g. old items that used a pasted photo URL) already
 * start with http/https and are returned unchanged.
 */
export const getImageUrl = (photoUrl) => {
  if (!photoUrl) return null;

  // Already a full URL (external image) — use as-is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }

  // REACT_APP_API_URL is like "http://localhost:5000/api" — strip the "/api"
  // to get the server's base origin where /uploads is served from.
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const serverOrigin = apiUrl.replace(/\/api\/?$/, '');

  return `${serverOrigin}${photoUrl}`;
};