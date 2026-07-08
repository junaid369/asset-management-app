const User = require('../models/User');
const logAudit = require('../utils/auditLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Manager)
exports.getUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('department', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin, Manager)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin, Manager — managers cannot touch admins)
exports.updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Managers may not edit admin accounts, nor grant the admin role
    // (prevents privilege escalation / admin lockout).
    if (req.user.role === 'manager') {
      if (target.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Managers cannot modify admin accounts',
        });
      }
      if (req.body.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Managers cannot assign the admin role',
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department', 'name');

    // Log audit
    await logAudit(req.user._id, 'update', 'user', user._id, `User ${user.email} updated`, {}, req);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    // Log audit
    await logAudit(req.user._id, 'delete', 'user', user._id, `User ${user.email} deleted`, {}, req);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Deactivate/Activate user
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Managers may not activate/deactivate admin accounts.
    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Managers cannot modify admin accounts',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Log audit
    await logAudit(
      req.user._id,
      'update',
      'user',
      user._id,
      `User ${user.email} ${user.isActive ? 'activated' : 'deactivated'}`,
      {},
      req
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
