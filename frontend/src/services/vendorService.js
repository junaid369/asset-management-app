import api from './api';

const vendorService = {
  // Get all vendors
  getVendors: (params) => api.get('/vendors', { params }),

  // Get single vendor
  getVendor: (id) => api.get(`/vendors/${id}`),

  // Create vendor
  createVendor: (data) => api.post('/vendors', data),

  // Update vendor
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data),

  // Delete vendor
  deleteVendor: (id) => api.delete(`/vendors/${id}`),
};

export default vendorService;
