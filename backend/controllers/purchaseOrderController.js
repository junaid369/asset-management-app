const PurchaseOrder = require('../models/PurchaseOrder');
const Asset = require('../models/Asset');
const logAudit = require('../utils/auditLogger');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, vendor, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (vendor) query.vendor = vendor;
    if (search) {
      query.$or = [
        { poNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('vendor', 'name email phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      data: purchaseOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendor')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('items.category', 'name')
      .populate('items.createdAssets');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin, Manager)
exports.createPurchaseOrder = async (req, res) => {
  try {
    const poData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const purchaseOrder = await PurchaseOrder.create(poData);

    // Log audit
    await logAudit(
      req.user._id,
      'create',
      'purchaseOrder',
      purchaseOrder._id,
      `Purchase Order ${purchaseOrder.poNumber} created`,
      {},
      req
    );

    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('vendor', 'name email')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedPO,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
// @access  Private (Admin, Manager)
exports.updatePurchaseOrder = async (req, res) => {
  try {
    let purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    // Don't allow updates if already received
    if (purchaseOrder.status === 'received' && req.body.status !== 'received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a received purchase order',
      });
    }

    const oldData = purchaseOrder.toObject();
    purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('vendor', 'name email')
      .populate('createdBy', 'firstName lastName');

    // Log audit
    await logAudit(
      req.user._id,
      'update',
      'purchaseOrder',
      purchaseOrder._id,
      `Purchase Order ${purchaseOrder.poNumber} updated`,
      { old: oldData, new: purchaseOrder.toObject() },
      req
    );

    res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Receive purchase order items (creates assets)
// @route   POST /api/purchase-orders/:id/receive
// @access  Private (Admin, Manager)
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { itemIndex, quantityReceived } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(req.params.id).populate('vendor');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    if (!purchaseOrder.items[itemIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in purchase order',
      });
    }

    const item = purchaseOrder.items[itemIndex];
    const qtyToReceive = quantityReceived || item.quantity - item.receivedQuantity;

    if (qtyToReceive <= 0) {
      return res.status(400).json({
        success: false,
        message: 'All items already received',
      });
    }

    if (item.receivedQuantity + qtyToReceive > item.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Cannot receive more than ordered quantity',
      });
    }

    // Create assets for received items
    const createdAssets = [];
    for (let i = 0; i < qtyToReceive; i++) {
      const assetData = {
        name: item.description,
        category: item.category,
        brand: item.brand || '',
        model: item.model || '',
        purchasePrice: item.unitPrice,
        purchaseDate: new Date(),
        vendor: purchaseOrder.vendor.name,
        status: 'available',
        notes: `Created from PO: ${purchaseOrder.poNumber}`,
      };

      if (item.specifications) {
        assetData.notes += ` | Specs: ${item.specifications}`;
      }

      const asset = await Asset.create(assetData);
      createdAssets.push(asset._id);

      // Log audit
      await logAudit(
        req.user._id,
        'create',
        'asset',
        asset._id,
        `Asset ${asset.assetTag} created from PO ${purchaseOrder.poNumber}`,
        {},
        req
      );
    }

    // Update PO item
    item.receivedQuantity += qtyToReceive;
    item.createdAssets.push(...createdAssets);

    // Check if all items are received
    const allReceived = purchaseOrder.items.every(
      (i) => i.receivedQuantity === i.quantity
    );

    if (allReceived) {
      purchaseOrder.status = 'received';
      purchaseOrder.deliveryDate = new Date();
    }

    await purchaseOrder.save();

    // Log audit
    await logAudit(
      req.user._id,
      'receive',
      'purchaseOrder',
      purchaseOrder._id,
      `Received ${qtyToReceive} items from PO ${purchaseOrder.poNumber}, created ${createdAssets.length} assets`,
      {},
      req
    );

    const updatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('vendor')
      .populate('items.createdAssets');

    res.status(200).json({
      success: true,
      message: `Successfully received ${qtyToReceive} items and created ${createdAssets.length} assets`,
      data: updatedPO,
      createdAssets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private (Admin)
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    // Don't allow deletion if already received
    if (purchaseOrder.status === 'received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a received purchase order',
      });
    }

    await purchaseOrder.deleteOne();

    // Log audit
    await logAudit(
      req.user._id,
      'delete',
      'purchaseOrder',
      purchaseOrder._id,
      `Purchase Order ${purchaseOrder.poNumber} deleted`,
      {},
      req
    );

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get purchase order statistics
// @route   GET /api/purchase-orders/stats/overview
// @access  Private
exports.getPurchaseOrderStats = async (req, res) => {
  try {
    const totalPOs = await PurchaseOrder.countDocuments();
    const draftPOs = await PurchaseOrder.countDocuments({ status: 'draft' });
    const pendingPOs = await PurchaseOrder.countDocuments({ status: 'pending' });
    const orderedPOs = await PurchaseOrder.countDocuments({ status: 'ordered' });
    const receivedPOs = await PurchaseOrder.countDocuments({ status: 'received' });

    // Total spending
    const allPOs = await PurchaseOrder.find({ status: { $ne: 'cancelled' } });
    const totalSpending = allPOs.reduce((sum, po) => sum + po.totalAmount, 0);

    // Spending by vendor
    const spendingByVendor = await PurchaseOrder.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$vendor',
          totalSpent: { $sum: '$totalAmount' },
          poCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      {
        $project: {
          vendorName: '$vendor.name',
          totalSpent: 1,
          poCount: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPOs,
        draftPOs,
        pendingPOs,
        orderedPOs,
        receivedPOs,
        totalSpending,
        spendingByVendor,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
