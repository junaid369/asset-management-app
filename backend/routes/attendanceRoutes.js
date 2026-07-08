const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  checkIn,
  checkOut,
  getAttendanceSummary,
  getMonthlyReport,
} = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Self-service check-in / check-out (any authenticated user)
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// Summary stats (admin/manager)
router.get('/summary', authorize('admin', 'manager'), getAttendanceSummary);

// Monthly report. Admin/manager can report on anyone; employees are
// restricted to their own record inside the controller.
router.get('/report', getMonthlyReport);

router
  .route('/')
  .get(getAttendance)
  .post(authorize('admin', 'manager'), markAttendance);

router
  .route('/:id')
  .get(getAttendanceById)
  .put(authorize('admin', 'manager'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

module.exports = router;
