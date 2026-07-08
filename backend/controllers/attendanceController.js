const Attendance = require('../models/Attendance');
const logAudit = require('../utils/auditLogger');

// Normalize any date to midnight UTC so there is one slot per calendar day
const normalizeDate = (value) => {
  const d = value ? new Date(value) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get attendance records (with filters)
// @route   GET /api/attendance
// @access  Private (employees see only their own; admin/manager see all)
exports.getAttendance = async (req, res) => {
  try {
    const { user, status, date, startDate, endDate } = req.query;

    const query = {};

    // Employees can only view their own attendance
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    } else if (user) {
      query.user = user;
    }

    if (status) query.status = status;

    if (date) {
      query.date = normalizeDate(date);
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = normalizeDate(startDate);
      if (endDate) query.date.$lte = normalizeDate(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'firstName lastName email employeeId department')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('user', 'firstName lastName email employeeId department')
      .populate('markedBy', 'firstName lastName');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Employees can only view their own record
    if (
      req.user.role === 'employee' &&
      attendance.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this record',
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark / record attendance manually (admin or manager)
// @route   POST /api/attendance
// @access  Private (Admin, Manager)
exports.markAttendance = async (req, res) => {
  try {
    const { user, date, status, checkIn, checkOut, notes } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User is required',
      });
    }

    const attendanceDate = normalizeDate(date);

    // Prevent duplicate entries for the same user/day
    const existing = await Attendance.findOne({ user, date: attendanceDate });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this user on this date already exists',
      });
    }

    const attendance = await Attendance.create({
      user,
      date: attendanceDate,
      status: status || 'present',
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      notes,
      markedBy: req.user._id,
    });

    await logAudit(
      req.user._id,
      'create',
      'attendance',
      attendance._id,
      `Attendance marked as '${attendance.status}' for user ${user}`,
      {},
      req
    );

    const populated = await attendance.populate('user', 'firstName lastName employeeId');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update an attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, Manager)
exports.updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    const oldData = attendance.toObject();

    const { status, checkIn, checkOut, notes, date } = req.body;
    if (status !== undefined) attendance.status = status;
    if (checkIn !== undefined) attendance.checkIn = checkIn || null;
    if (checkOut !== undefined) attendance.checkOut = checkOut || null;
    if (notes !== undefined) attendance.notes = notes;
    if (date !== undefined) attendance.date = normalizeDate(date);
    attendance.markedBy = req.user._id;

    // Save (triggers workHours recompute); handles duplicate-key on date change
    await attendance.save();

    await logAudit(
      req.user._id,
      'update',
      'attendance',
      attendance._id,
      `Attendance updated to '${attendance.status}'`,
      { old: oldData, new: attendance.toObject() },
      req
    );

    attendance = await attendance.populate('user', 'firstName lastName employeeId');

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An attendance record already exists for this user on that date',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await attendance.deleteOne();

    await logAudit(
      req.user._id,
      'delete',
      'attendance',
      attendance._id,
      'Attendance record deleted',
      {},
      req
    );

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Self check-in for the current day
// @route   POST /api/attendance/check-in
// @access  Private (any authenticated user)
exports.checkIn = async (req, res) => {
  try {
    const today = normalizeDate();
    const now = new Date();

    let attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today',
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        user: req.user._id,
        date: today,
        markedBy: req.user._id,
      });
    }

    attendance.checkIn = now;
    // If checking in after 9:30 AM, flag as late (business rule, adjustable)
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 30, 0, 0);
    attendance.status = now > lateThreshold ? 'late' : 'present';
    attendance.markedBy = req.user._id;

    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Self check-out for the current day
// @route   POST /api/attendance/check-out
// @access  Private (any authenticated user)
exports.checkOut = async (req, res) => {
  try {
    const today = normalizeDate();

    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You must check in before checking out',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today',
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Attendance summary / stats
// @route   GET /api/attendance/summary
// @access  Private (Admin, Manager)
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = normalizeDate(date);

    const records = await Attendance.find({ date: targetDate });

    const summary = {
      date: targetDate,
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      halfDay: records.filter((r) => r.status === 'half-day').length,
      onLeave: records.filter((r) => r.status === 'on-leave').length,
      holiday: records.filter((r) => r.status === 'holiday').length,
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Monthly attendance report for a single user
// @route   GET /api/attendance/report?user=<id>&month=YYYY-MM
// @access  Private (Admin, Manager)
exports.getMonthlyReport = async (req, res) => {
  try {
    const { user, month } = req.query;

    if (!user || !month) {
      return res.status(400).json({
        success: false,
        message: 'user and month (YYYY-MM) are required',
      });
    }

    const [year, mon] = month.split('-').map(Number);
    if (!year || !mon || mon < 1 || mon > 12) {
      return res.status(400).json({
        success: false,
        message: 'month must be in YYYY-MM format',
      });
    }

    // First day of the month to first day of the next month (exclusive)
    const start = new Date(year, mon - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, mon, 1);
    end.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      user,
      date: { $gte: start, $lt: end },
    })
      .populate('user', 'firstName lastName email employeeId')
      .sort({ date: 1 });

    const count = (status) => records.filter((r) => r.status === status).length;
    const present = count('present');
    const late = count('late');
    const halfDay = count('half-day');
    const totalWorkHours = Math.round(
      records.reduce((sum, r) => sum + (r.workHours || 0), 0) * 100
    ) / 100;

    // Present + late + half-day count as "attended" days
    const attendedDays = present + late + halfDay;
    const daysRecorded = records.length;

    const summary = {
      month,
      employee: records[0]?.user || null,
      present,
      absent: count('absent'),
      late,
      halfDay,
      onLeave: count('on-leave'),
      holiday: count('holiday'),
      daysRecorded,
      totalWorkHours,
      // % of recorded days actually attended (avoids dividing by an unknown
      // number of company working days)
      attendancePercentage:
        daysRecorded > 0 ? Math.round((attendedDays / daysRecorded) * 100) : 0,
    };

    const days = records.map((r) => ({
      _id: r._id,
      date: r.date,
      status: r.status,
      checkIn: r.checkIn || null,
      checkOut: r.checkOut || null,
      workHours: r.workHours || 0,
      notes: r.notes || '',
    }));

    res.status(200).json({
      success: true,
      data: { summary, days },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
