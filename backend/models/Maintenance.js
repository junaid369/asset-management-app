const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    maintenanceType: {
      type: String,
      enum: ['scheduled', 'repair', 'upgrade', 'inspection'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Maintenance title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    performedBy: {
      type: String,
      trim: true,
    },
    vendor: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    documents: [{
      fileName: String,
      filePath: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
