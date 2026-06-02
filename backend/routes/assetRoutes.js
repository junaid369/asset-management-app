const express = require('express');
const {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getAssetStats,
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/stats/overview').get(protect, getAssetStats);

router
  .route('/')
  .get(protect, getAssets)
  .post(protect, authorize('admin', 'manager'), createAsset);

router
  .route('/:id')
  .get(protect, getAsset)
  .put(protect, authorize('admin', 'manager'), updateAsset)
  .delete(protect, authorize('admin'), deleteAsset);

router.route('/:id/assign').post(protect, authorize('admin', 'manager'), assignAsset);

router.route('/:id/return').post(protect, authorize('admin', 'manager'), returnAsset);

module.exports = router;
