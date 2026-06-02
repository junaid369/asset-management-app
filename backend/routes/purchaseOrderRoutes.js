const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderStats,
} = require('../controllers/purchaseOrderController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats/overview', getPurchaseOrderStats);

router
  .route('/')
  .get(getPurchaseOrders)
  .post(authorize('admin', 'manager'), createPurchaseOrder);

router
  .route('/:id')
  .get(getPurchaseOrder)
  .put(authorize('admin', 'manager'), updatePurchaseOrder)
  .delete(authorize('admin'), deletePurchaseOrder);

router.post('/:id/receive', authorize('admin', 'manager'), receivePurchaseOrder);

module.exports = router;
