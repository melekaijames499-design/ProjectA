const PumpLog = require('../models/PumpLog');
const Farm = require('../models/Farm');
const { success, error } = require('../utils/apiResponse');
const socketService = require('../services/socketService');

// Check access helper
const checkFarmAccess = (user, farmId) => {
  if (user.role === 'admin') return true;
  return user.farmId && user.farmId.toString() === farmId.toString();
};

/**
 * @desc    Manually control pump ON/OFF state
 * @route   POST /api/pump/control
 * @access  Private (Farmer, Admin)
 */
exports.controlPump = async (req, res, next) => {
  try {
    const { farmId, action, duration, notes } = req.body;

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm pump control', 'FORBIDDEN', 403);
    }

    const farm = await Farm.findById(farmId);
    if (!farm || !farm.isActive) {
      return error(res, 'Farm not found or inactive', 'FARM_INACTIVE', 400);
    }

    // Check if state is actually changing (optional, but good practice)
    const lastLog = await PumpLog.findOne({ farmId }).sort({ timestamp: -1 });
    if (lastLog && lastLog.action === action) {
      return error(res, `Pump is already ${action}`, 'PUMP_STATE_MATCH', 400);
    }

    // Create log
    const pumpLog = await PumpLog.create({
      farmId,
      action,
      triggeredBy: req.user._id,
      triggerType: 'manual',
      duration: duration || null,
      notes: notes || ''
    });

    const populatedLog = await PumpLog.findById(pumpLog._id)
      .populate('triggeredBy', 'name');

    // Emit socket event to farm's room
    socketService.emitToRoom(farmId.toString(), 'pump_status_change', {
      farmId,
      status: action,
      log: populatedLog
    });

    return success(res, populatedLog, `Pump turned ${action} successfully`);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get pump logs for farm
 * @route   GET /api/pump/logs
 * @access  Private
 */
exports.getPumpLogs = async (req, res, next) => {
  try {
    const { farmId, from, to, limit = 20 } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm data', 'FORBIDDEN', 403);
    }

    const query = { farmId };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const logs = await PumpLog.find(query)
      .populate('triggeredBy', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return success(res, logs, 'Pump logs fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current pump status for a farm
 * @route   GET /api/pump/status
 * @access  Private
 */
exports.getPumpStatus = async (req, res, next) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm data', 'FORBIDDEN', 403);
    }

    const lastLog = await PumpLog.findOne({ farmId }).sort({ timestamp: -1 });

    return success(res, {
      status: lastLog ? lastLog.action : 'OFF',
      lastChanged: lastLog ? lastLog.timestamp : null,
      triggerType: lastLog ? lastLog.triggerType : null,
      triggeredBy: lastLog && lastLog.triggeredBy ? lastLog.triggeredBy : null
    }, 'Pump status fetched successfully');
  } catch (err) {
    next(err);
  }
};
