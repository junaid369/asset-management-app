const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Normalized to midnight (00:00:00) so there is one record per user per day
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave', 'holiday'],
      default: 'present',
    },
    // Total worked hours, auto-computed from checkIn/checkOut
    workHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Who recorded / last edited this entry (admin/manager for manual marking,
    // or the user themselves for self check-in)
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Compute work hours whenever both check-in and check-out are present
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut && this.checkOut > this.checkIn) {
    const diffMs = this.checkOut - this.checkIn;
    this.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
