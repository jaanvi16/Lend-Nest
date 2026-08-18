import apiClient from './apiClient';

export const ratingAPI = {
  createRating: (data) => apiClient.post('/ratings', data),
  getUserRatings: (userId) => apiClient.get(`/ratings/user/${userId}`),
  getRatingStatus: (borrowRequestId) => apiClient.get(`/ratings/status/${borrowRequestId}`),
};