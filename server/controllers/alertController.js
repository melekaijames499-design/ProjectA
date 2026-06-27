const Alert = require('../models/Alert');
const Farm = require('../models/Farm');
const { success, error } = require('../utils/apiResponse');
const socketService = require('../services/socketService');

// Check farm access
const checkFarmAccess = (user, farmId) => {
  if (user.role === 'admin') return true;
  return user.farmId && user.farmId.toString() === farmId.toString();
};

/**
 * @desc    Get alerts for a farm
 * @route   GET /api/alerts
 * @access  Private
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const { farmId, isResolved, severity } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm alerts', 'FORBIDDEN', 403);
    }

    const query = { farmId };

    if (isResolved !== undefined && isResolved !== 'all') {
      query.isResolved = isResolved === 'true';
    }

    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    const alerts = await Alert.find(query)
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    return success(res, alerts, 'Alerts fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Resolve alert manually
 * @route   PUT /api/alerts/:id/resolve
 * @access  Private (Farmer, Admin)
 */
exports.resolveAlert = async (req, res, next) => {
  try {
    const alertId = req.params.id;
    const alert = await Alert.findById(alertId);

    if (!alert) {
      return error(res, 'Alert not found', 'ALERT_NOT_FOUND', 404);
    }

    if (!checkFarmAccess(req.user, alert.farmId)) {
      return error(res, 'Access denied to this farm alert', 'FORBIDDEN', 403);
    }

    if (alert.isResolved) {
      return error(res, 'Alert is already resolved', 'ALREADY_RESOLVED', 400);
    }

    alert.isResolved = true;
    alert.resolvedBy = req.user._id;
    alert.resolvedAt = new Date();

    await alert.save();

    const populatedAlert = await Alert.findById(alert._id)
      .populate('resolvedBy', 'name');

    // Emit socket events
    socketService.emitToRoom(alert.farmId.toString(), 'alert_resolved', {
      alertId: alert._id,
      farmId: alert.farmId
    });
    
    socketService.emitToRoom('admin', 'alert_resolved', {
      alertId: alert._id,
      farmId: alert.farmId
    });

    return success(res, populatedAlert, 'Alert resolved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Trigger test alert
 * @route   POST /api/alerts/test
 * @access  Private (Admin only)
 */
exports.testAlert = async (req, res, next) => {
  try {
    const { farmId, type, severity, message } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm || !farm.isActive) {
      return error(res, 'Farm not found or inactive', 'FARM_INACTIVE', 400);
    }

    // Default values if not specified
    const alertType = type || 'low_moisture';
    const alertSeverity = severity || 'warning';
    const alertMsg = message || `Simulated ${alertSeverity} alert for ${alertType} on ${farm.name}`;

    const alert = await Alert.create({
      farmId,
      type: alertType,
      severity: alertSeverity,
      message: alertMsg,
      isResolved: false
    });

    // Emit to rooms
    socketService.emitToRoom(farmId.toString(), 'new_alert', {
      farmId,
      alert
    });
    
    socketService.emitToRoom('admin', 'new_alert', {
      farmId,
      alert
    });

    return success(res, alert, 'Test alert generated successfully', 201);
  } catch (err) {
    next(err);
  }
};
