const Vendor = require('../models/Vendor');
const logAudit = require('../utils/auditLogger');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
exports.getVendors = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create vendor
// @route   POST /api/vendors
// @access  Private (Admin, Manager)
exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);

    // Log audit
    await logAudit(req.user._id, 'create', 'vendor', vendor._id, `Vendor ${vendor.name} created`, {}, req);

    res.status(201).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin, Manager)
exports.updateVendor = async (req, res) => {
  try {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    const oldData = vendor.toObject();
    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log audit
    await logAudit(
      req.user._id,
      'update',
      'vendor',
      vendor._id,
      `Vendor ${vendor.name} updated`,
      { old: oldData, new: vendor.toObject() },
      req
    );

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin)
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    await vendor.deleteOne();

    // Log audit
    await logAudit(req.user._id, 'delete', 'vendor', vendor._id, `Vendor ${vendor.name} deleted`, {}, req);

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
