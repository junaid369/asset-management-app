const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin', 'manager'), getUsers);

router
  .route('/:id')
  .get(protect, authorize('admin', 'manager'), getUser)
  .put(protect, authorize('admin', 'manager'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/:id/toggle-status').put(protect, authorize('admin', 'manager'), toggleUserStatus);

module.exports = router;
