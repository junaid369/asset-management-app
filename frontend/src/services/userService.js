import api from './api';

const userService = {
  // Get all users
  getUsers: (params) => api.get('/users', { params }),

  // Get single user
  getUser: (id) => api.get(`/users/${id}`),

  // Create user
  createUser: (data) => api.post('/users', data),

  // Update user
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default userService;
