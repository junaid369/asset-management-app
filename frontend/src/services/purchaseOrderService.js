import api from './api';

const purchaseOrderService = {
  // Get all purchase orders
  getPurchaseOrders: (params) => api.get('/purchase-orders', { params }),

  // Get single purchase order
  getPurchaseOrder: (id) => api.get(`/purchase-orders/${id}`),

  // Create purchase order
  createPurchaseOrder: (data) => api.post('/purchase-orders', data),

  // Update purchase order
  updatePurchaseOrder: (id, data) => api.put(`/purchase-orders/${id}`, data),

  // Delete purchase order
  deletePurchaseOrder: (id) => api.delete(`/purchase-orders/${id}`),

  // Receive purchase order items
  receivePurchaseOrderItems: (id, data) => api.post(`/purchase-orders/${id}/receive`, data),

  // Get purchase order statistics
  getPurchaseOrderStats: () => api.get('/purchase-orders/stats/overview'),
};

export default purchaseOrderService;
