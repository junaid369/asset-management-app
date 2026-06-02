const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    returnDate: {
      type: Date,
    },
    expectedReturnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'returned', 'overdue'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
    },
    returnCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    },
    returnNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
