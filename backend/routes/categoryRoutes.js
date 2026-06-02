const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getCategories)
  .post(protect, authorize('admin', 'manager'), createCategory);

router
  .route('/:id')
  .get(protect, getCategory)
  .put(protect, authorize('admin', 'manager'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
