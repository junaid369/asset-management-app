import api from './api';

const attendanceService = {
  // Get attendance records (filters: user, status, date, startDate, endDate)
  getAttendance: (params) => api.get('/attendance', { params }),

  // Get single attendance record
  getAttendanceById: (id) => api.get(`/attendance/${id}`),

  // Mark attendance manually (admin/manager)
  markAttendance: (data) => api.post('/attendance', data),

  // Update an attendance record
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),

  // Delete an attendance record
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),

  // Self check-in / check-out
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),

  // Daily summary stats
  getSummary: (params) => api.get('/attendance/summary', { params }),
};

export default attendanceService;
