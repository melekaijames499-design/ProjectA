const SensorReading = require('../models/SensorReading');
const Farm = require('../models/Farm');
const { success, error } = require('../utils/apiResponse');

// Services triggers
const alertService = require('../services/alertService');
const pumpAutomation = require('../services/pumpAutomation');
const socketService = require('../services/socketService');

// Check if user has access to this farm
const checkFarmAccess = (user, farmId) => {
  if (user.role === 'admin') return true;
  return user.farmId && user.farmId.toString() === farmId.toString();
};

/**
 * @desc    Submit manual sensor reading
 * @route   POST /api/sensors/readings
 * @access  Private (Farmer, Admin only)
 */
exports.submitReading = async (req, res, next) => {
  try {
    const { farmId, soilMoisture, temperature, humidity, timestamp, notes } = req.body;

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm', 'FORBIDDEN', 403);
    }

    // Verify farm is active
    const farm = await Farm.findById(farmId);
    if (!farm || !farm.isActive) {
      return error(res, 'Farm is not active or does not exist', 'FARM_INACTIVE', 400);
    }

    const readingTime = timestamp ? new Date(timestamp) : new Date();

    const reading = await SensorReading.create({
      farmId,
      soilMoisture,
      temperature,
      humidity,
      inputMethod: 'manual',
      enteredBy: req.user._id,
      timestamp: readingTime,
      notes: notes || ''
    });

    // Populate enteredBy for front-end details
    const populatedReading = await SensorReading.findById(reading._id)
      .populate('enteredBy', 'name');

    // Socket.IO broadcast to room
    socketService.emitToRoom(farmId.toString(), 'new_reading', {
      farmId,
      reading: populatedReading
    });

    // Trigger automation services (non-blocking errors)
    try {
      await alertService.checkReadings(reading);
      await pumpAutomation.checkReadings(reading);
    } catch (svcErr) {
      console.error('Automation services trigger failed:', svcErr.message);
    }

    return success(res, populatedReading, 'Sensor reading submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get readings for farm (query: farmId, from, to, limit)
 * @route   GET /api/sensors/readings
 * @access  Private
 */
exports.getReadings = async (req, res, next) => {
  try {
    const { farmId, from, to, limit = 100 } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm', 'FORBIDDEN', 403);
    }

    const query = { farmId };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const readings = await SensorReading.find(query)
      .populate('enteredBy', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return success(res, readings, 'Readings fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get latest reading for farm
 * @route   GET /api/sensors/readings/latest
 * @access  Private
 */
exports.getLatestReading = async (req, res, next) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm', 'FORBIDDEN', 403);
    }

    const reading = await SensorReading.findOne({ farmId })
      .populate('enteredBy', 'name')
      .sort({ timestamp: -1 });

    return success(res, reading || null, 'Latest reading fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get aggregate stats for a date range (farmId, from, to)
 * @route   GET /api/sensors/readings/stats
 * @access  Private
 */
exports.getReadingStats = async (req, res, next) => {
  try {
    const { farmId, from, to } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm', 'FORBIDDEN', 403);
    }

    const matchStage = {
      farmId: new Object(farmId)
    };

    if (from || to) {
      matchStage.timestamp = {};
      if (from) matchStage.timestamp.$gte = new Date(from);
      if (to) matchStage.timestamp.$lte = new Date(to);
    }

    // Direct Mongoose object conversion check (avoid mongoose cast errors on group query)
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(farmId)) {
      matchStage.farmId = new mongoose.Types.ObjectId(farmId);
    }

    const stats = await SensorReading.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$farmId',
          avgMoisture: { $avg: '$soilMoisture' },
          minMoisture: { $min: '$soilMoisture' },
          maxMoisture: { $max: '$soilMoisture' },
          avgTemp: { $avg: '$temperature' },
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' }
        }
      }
    ]);

    const result = stats[0] ? {
      avgMoisture: parseFloat(stats[0].avgMoisture.toFixed(1)),
      minMoisture: stats[0].minMoisture,
      maxMoisture: stats[0].maxMoisture,
      avgTemp: parseFloat(stats[0].avgTemp.toFixed(1)),
      minTemp: stats[0].minTemp,
      maxTemp: stats[0].maxTemp,
      avgHumidity: parseFloat(stats[0].avgHumidity.toFixed(1)),
      minHumidity: stats[0].minHumidity,
      maxHumidity: stats[0].maxHumidity
    } : {
      avgMoisture: 0, minMoisture: 0, maxMoisture: 0,
      avgTemp: 0, minTemp: 0, maxTemp: 0,
      avgHumidity: 0, minHumidity: 0, maxHumidity: 0
    };

    return success(res, result, 'Stats computed successfully');
  } catch (err) {
    next(err);
  }
};
