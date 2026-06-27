const Farm = require('../models/Farm');
const Threshold = require('../models/Threshold');
const SensorReading = require('../models/SensorReading');
const PumpLog = require('../models/PumpLog');
const Alert = require('../models/Alert');
const { success, error } = require('../utils/apiResponse');

// Middleware check helper to enforce user has access to farm
const checkFarmAccess = (user, farmId) => {
  if (user.role === 'admin') return true;
  return user.farmId && user.farmId.toString() === farmId.toString();
};

/**
 * @desc    Get farm details and current thresholds
 * @route   GET /api/farms/:id
 * @access  Private
 */
exports.getFarmDetails = async (req, res, next) => {
  try {
    const farmId = req.params.id;

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm data', 'FORBIDDEN', 403);
    }

    const farm = await Farm.findById(farmId).populate('owner', 'name email');
    if (!farm) {
      return error(res, 'Farm not found', 'FARM_NOT_FOUND', 404);
    }

    // Get thresholds (upsert defaults if they don't exist yet)
    let thresholds = await Threshold.findOne({ farmId });
    if (!thresholds) {
      // Create defaults
      thresholds = await Threshold.create({
        farmId,
        minMoisture: 30,
        maxMoisture: 70,
        maxTemperature: 35,
        minHumidity: 20,
        updatedBy: farm.owner // default to owner
      });
    }

    return success(res, {
      farm,
      thresholds
    }, 'Farm details fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get farm live summary (latest reading, pump status, alerts count)
 * @route   GET /api/farms/:id/summary
 * @access  Private
 */
exports.getFarmSummary = async (req, res, next) => {
  try {
    const farmId = req.params.id;

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm data', 'FORBIDDEN', 403);
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return error(res, 'Farm not found', 'FARM_NOT_FOUND', 404);
    }

    // Get latest reading
    const latestReading = await SensorReading.findOne({ farmId })
      .sort({ timestamp: -1 });

    // Get pump status (last action log)
    const latestPumpAction = await PumpLog.findOne({ farmId })
      .sort({ timestamp: -1 });

    // Get active alerts count
    const activeAlertsCount = await Alert.countDocuments({
      farmId,
      isResolved: false
    });

    return success(res, {
      farmName: farm.name,
      cropType: farm.cropType,
      latestReading: latestReading || null,
      pumpStatus: latestPumpAction ? latestPumpAction.action : 'OFF',
      latestPumpLog: latestPumpAction || null,
      activeAlertsCount
    }, 'Farm summary compiled successfully');
  } catch (err) {
    next(err);
  }
};
