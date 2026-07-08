const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create', 'update', 'delete',
        'assign', 'unassign',
        'login', 'logout',
        'export', 'import'
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['asset', 'user', 'category', 'department', 'assignment', 'maintenance', 'vendor', 'purchaseOrder', 'attendance'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
