import apiClient from './apiClient';

export const messageAPI = {
  getMessages: (borrowRequestId) => apiClient.get(`/messages/${borrowRequestId}`),
  sendMessage: (borrowRequestId, text) => apiClient.post(`/messages/${borrowRequestId}`, { text }),
  getUnreadCount: () => apiClient.get('/messages/unread-count'),
  getUnreadCountsByRequest: () => apiClient.get('/messages/unread-counts'),
};