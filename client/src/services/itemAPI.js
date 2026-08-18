import apiClient from './apiClient';

/**
 * Item API functions
 */

export const itemAPI = {
  // Get all items (with optional filters)
  getAllItems: async (latitude, longitude, distance, category, search, available) => {
    const params = new URLSearchParams();
    if (latitude) params.append('latitude', latitude);
    if (longitude) params.append('longitude', longitude);
    if (distance) params.append('distance', distance);
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (available) params.append('available', available);

    return apiClient.get(`/items?${params.toString()}`);
  },

  // Get single item
  getItem: async (id) => {
    return apiClient.get(`/items/${id}`);
  },

  // Create item — itemData can be a plain object OR a FormData (when a photo file is included)
  createItem: async (itemData) => {
    const isFormData = itemData instanceof FormData;
    return apiClient.post('/items', itemData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  // Update item — same FormData support as createItem
  updateItem: async (id, itemData) => {
    const isFormData = itemData instanceof FormData;
    return apiClient.put(`/items/${id}`, itemData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  // Delete item
  deleteItem: async (id) => {
    return apiClient.delete(`/items/${id}`);
  },

  // Get current user's items
  getMyItems: async () => {
    return apiClient.get('/items/my-items');
  },

  // Get items by a specific lender
  getItemsByLender: async (lenderId) => {
    return apiClient.get(`/items/lender/${lenderId}`);
  },
};