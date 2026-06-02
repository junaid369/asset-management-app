import api from './api';

const categoryService = {
  // Get all categories
  getCategories: () => api.get('/categories'),

  // Get single category
  getCategory: (id) => api.get(`/categories/${id}`),

  // Create category
  createCategory: (data) => api.post('/categories', data),

  // Update category
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),

  // Delete category
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export default categoryService;
