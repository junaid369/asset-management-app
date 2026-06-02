const Asset = require('../models/Asset');
const Assignment = require('../models/Assignment');
const QRCode = require('qrcode');
const logAudit = require('../utils/auditLogger');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const { status, category, assignedTo, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await Asset.find(query)
      .populate('category', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Asset.countDocuments(query);

    res.status(200).json({
      success: true,
      count: assets.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name description')
      .populate('assignedTo', 'firstName lastName email employeeId');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create asset
// @route   POST /api/assets
// @access  Private (Admin, Manager)
exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);

    // Generate QR Code
    const qrCodeData = `${process.env.APP_URL || 'http://localhost:3000'}/assets/${asset._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);
    asset.qrCode = qrCode;
    await asset.save();

    // Log audit
    await logAudit(req.user._id, 'create', 'asset', asset._id, `Asset ${asset.assetTag} created`, {}, req);

    const populatedAsset = await Asset.findById(asset._id).populate('category', 'name');

    res.status(201).json({
      success: true,
      data: populatedAsset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin, Manager)
exports.updateAsset = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const oldData = asset.toObject();
    asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    // Log audit
    await logAudit(
      req.user._id,
      'update',
      'asset',
      asset._id,
      `Asset ${asset.assetTag} updated`,
      { old: oldData, new: asset.toObject() },
      req
    );

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    await asset.deleteOne();

    // Log audit
    await logAudit(req.user._id, 'delete', 'asset', asset._id, `Asset ${asset.assetTag} deleted`, {}, req);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Assign asset to user
// @route   POST /api/assets/:id/assign
// @access  Private (Admin, Manager)
exports.assignAsset = async (req, res) => {
  try {
    const { userId, notes, expectedReturnDate } = req.body;

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    if (asset.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Asset is already assigned',
      });
    }

    // Update asset
    asset.assignedTo = userId;
    asset.assignedDate = Date.now();
    asset.status = 'assigned';
    await asset.save();

    // Create assignment record
    const assignment = await Assignment.create({
      asset: asset._id,
      user: userId,
      assignedBy: req.user._id,
      notes,
      expectedReturnDate,
    });

    // Log audit
    await logAudit(req.user._id, 'assign', 'asset', asset._id, `Asset ${asset.assetTag} assigned to user`, {}, req);

    const populatedAsset = await Asset.findById(asset._id)
      .populate('category', 'name')
      .populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      data: populatedAsset,
      assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Return assigned asset
// @route   POST /api/assets/:id/return
// @access  Private (Admin, Manager)
exports.returnAsset = async (req, res) => {
  try {
    const { returnCondition, returnNotes } = req.body;

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    if (asset.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Asset is not currently assigned',
      });
    }

    // Find active assignment
    const assignment = await Assignment.findOne({
      asset: asset._id,
      status: 'active',
    });

    if (assignment) {
      assignment.returnDate = Date.now();
      assignment.status = 'returned';
      assignment.returnCondition = returnCondition;
      assignment.returnNotes = returnNotes;
      await assignment.save();
    }

    // Update asset
    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.status = 'available';
    asset.condition = returnCondition || asset.condition;
    await asset.save();

    // Log audit
    await logAudit(req.user._id, 'unassign', 'asset', asset._id, `Asset ${asset.assetTag} returned`, {}, req);

    const populatedAsset = await Asset.findById(asset._id).populate('category', 'name');

    res.status(200).json({
      success: true,
      data: populatedAsset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get asset statistics
// @route   GET /api/assets/stats/overview
// @access  Private
exports.getAssetStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const availableAssets = await Asset.countDocuments({ status: 'available' });
    const assignedAssets = await Asset.countDocuments({ status: 'assigned' });
    const maintenanceAssets = await Asset.countDocuments({ status: 'maintenance' });
    const retiredAssets = await Asset.countDocuments({ status: 'retired' });

    // Total value
    const assets = await Asset.find();
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);
    const currentValue = assets.reduce((sum, asset) => sum + asset.getCurrentValue(), 0);

    // Assets by category
    const assetsByCategory = await Asset.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          _id: 1,
          name: '$category.name',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        availableAssets,
        assignedAssets,
        maintenanceAssets,
        retiredAssets,
        totalValue,
        currentValue,
        assetsByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
