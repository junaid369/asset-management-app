import api from './api';

const assetService = {
  // Get all assets
  getAssets: (params) => api.get('/assets', { params }),

  // Get single asset
  getAsset: (id) => api.get(`/assets/${id}`),

  // Create asset
  createAsset: (data) => api.post('/assets', data),

  // Update asset
  updateAsset: (id, data) => api.put(`/assets/${id}`, data),

  // Delete asset
  deleteAsset: (id) => api.delete(`/assets/${id}`),

  // Assign asset
  assignAsset: (id, data) => api.post(`/assets/${id}/assign`, data),

  // Return asset
  returnAsset: (id, data) => api.post(`/assets/${id}/return`, data),

  // Get asset statistics
  getAssetStats: () => api.get('/assets/stats/overview'),
};

export default assetService;
