import apiClient from './apiClient';

export const requestAPI = {
  createRequest: (data) => apiClient.post('/requests', data),
  getSentRequests: () => apiClient.get('/requests/sent'),
  getReceivedRequests: () => apiClient.get('/requests/received'),
  respondToRequest: (id, action, rejectionReason) =>
    apiClient.put(`/requests/${id}/respond`, { action, rejectionReason }),
  updateStatus: (id, status) => apiClient.put(`/requests/${id}/status`, { status }),
  cancelRequest: (id) => apiClient.put(`/requests/${id}/cancel`),
};