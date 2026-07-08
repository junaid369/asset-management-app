const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Creating users is an admin/manager action, not open self-registration.
// (The initial users are created via the seed script, which bypasses routes.)
router.post('/register', protect, authorize('admin', 'manager'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
