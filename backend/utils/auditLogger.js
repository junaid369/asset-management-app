const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, entityType, entityId, description, changes = {}, req = null) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      description,
      changes,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers['user-agent'],
    });
  } catch (error) {
    console.error('Audit logging failed:', error.message);
  }
};

module.exports = logAudit;
