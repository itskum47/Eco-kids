const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Get all audit logs with filtering and pagination
 * @route   GET /api/audit/logs
 * @access  Private (Admin/State Admin only)
 */
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    action,
    actorRole,
    status,
    targetType,
    startDate,
    endDate,
    sortBy = '-createdAt'
  } = req.query;

  // Build filters
  const filters = {};

  if (action) {
    filters.action = action.toUpperCase();
  }

  if (actorRole) {
    filters.actorRole = actorRole;
  }

  if (status) {
    filters.status = status;
  }

  if (targetType) {
    filters.targetType = targetType;
  }

  // Date range filtering
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) {
      filters.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filters.createdAt.$lte = new Date(endDate);
    }
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };

  // Execute query
  const auditLogs = await AuditLog.searchAuditLogs(filters, options);
  const total = await AuditLog.countAuditLogs(filters);

  res.status(200).json({
    success: true,
    data: auditLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get audit logs by specific user (actor)
 * @route   GET /api/audit/logs/user/:actorId
 * @access  Private (Admin/State Admin or the user themselves)
 */
exports.getAuditLogsByUser = asyncHandler(async (req, res, next) => {
  const { actorId } = req.params;
  const { page = 1, limit = 50, action, status, sortBy = '-createdAt' } = req.query;

  // Check authorization: allow if admin/state_admin or if user is viewing own logs
  if (req.user.role !== 'admin' && req.user.role !== 'state_admin' && req.user.id !== actorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these audit logs'
    });
  }

  const filters = { actorId };

  if (action) {
    filters.action = action.toUpperCase();
  }

  if (status) {
    filters.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };

  const auditLogs = await AuditLog.searchAuditLogs(filters, options);
  const total = await AuditLog.countAuditLogs(filters);

  res.status(200).json({
    success: true,
    data: auditLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get audit logs by specific action
 * @route   GET /api/audit/logs/action/:action
 * @access  Private (Admin/State Admin only)
 */
exports.getAuditLogsByAction = asyncHandler(async (req, res, next) => {
  const { action } = req.params;
  const { page = 1, limit = 50, actorRole, status, sortBy = '-createdAt' } = req.query;

  const filters = { action: action.toUpperCase() };

  if (actorRole) {
    filters.actorRole = actorRole;
  }

  if (status) {
    filters.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };

  const auditLogs = await AuditLog.searchAuditLogs(filters, options);
  const total = await AuditLog.countAuditLogs(filters);

  res.status(200).json({
    success: true,
    data: auditLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get audit logs by target entity
 * @route   GET /api/audit/logs/target/:targetType/:targetId
 * @access  Private (Admin/State Admin only)
 */
exports.getAuditLogsByTarget = asyncHandler(async (req, res, next) => {
  const { targetType, targetId } = req.params;
  const { page = 1, limit = 50, sortBy = '-createdAt' } = req.query;

  const filters = { targetType, targetId };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };

  const auditLogs = await AuditLog.searchAuditLogs(filters, options);
  const total = await AuditLog.countAuditLogs(filters);

  res.status(200).json({
    success: true,
    data: auditLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Generate audit report for compliance
 * @route   GET /api/audit/report
 * @access  Private (State Admin only)
 */
exports.generateAuditReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, actorRole } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required'
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const filters = {};
  if (actorRole) {
    filters.actorRole = actorRole;
  }

  const report = await AuditLog.generateAuditReport(start, end, filters);

  res.status(200).json({
    success: true,
    data: report
  });
});

/**
 * @desc    Get audit log by ID
 * @route   GET /api/audit/logs/:id
 * @access  Private (Admin/State Admin only)
 */
exports.getAuditLogById = asyncHandler(async (req, res, next) => {
  const auditLog = await AuditLog.findById(req.params.id);

  if (!auditLog) {
    return res.status(404).json({
      success: false,
      message: 'Audit log not found'
    });
  }

  res.status(200).json({
    success: true,
    data: auditLog
  });
});

/**
 * @desc    Get audit log statistics
 * @route   GET /api/audit/stats
 * @access  Private (Admin/State Admin only)
 */
exports.getAuditStats = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const filters = {
    createdAt: { $gte: startDate }
  };

  const [totalLogs, failedActions, byRole, byAction] = await Promise.all([
    AuditLog.countDocuments(filters),
    AuditLog.countDocuments({ ...filters, status: 'failure' }),
    AuditLog.aggregate([
      { $match: filters },
      { $group: { _id: '$actorRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    AuditLog.aggregate([
      { $match: filters },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      period: {
        days: parseInt(days),
        startDate,
        endDate: new Date()
      },
      totalLogs,
      failedActions,
      byRole,
      byAction
    }
  });
});

/**
 * @desc    Search audit logs with advanced filtering
 * @route   POST /api/audit/search
 * @access  Private (Admin/State Admin only)
 */
exports.searchAuditLogs = asyncHandler(async (req, res, next) => {
  const {
    filters = {},
    page = 1,
    limit = 50,
    sortBy = '-createdAt'
  } = req.body;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };

  const auditLogs = await AuditLog.searchAuditLogs(filters, options);
  const total = await AuditLog.countAuditLogs(filters);

  res.status(200).json({
    success: true,
    data: auditLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});
