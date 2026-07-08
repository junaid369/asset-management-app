const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// The entire Vendors module is restricted to admin/manager.
// Employees have no vendor access at all (not just hidden in the nav).
router.use(authorize('admin', 'manager'));

router
  .route('/')
  .get(getVendors)
  .post(authorize('admin', 'manager'), createVendor);

router
  .route('/:id')
  .get(getVendor)
  .put(authorize('admin', 'manager'), updateVendor)
  .delete(authorize('admin'), deleteVendor);

module.exports = router;
