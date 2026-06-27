const Threshold = require('../models/Threshold');
const Farm = require('../models/Farm');
const { success, error } = require('../utils/apiResponse');

// Check access helper
const checkFarmAccess = (user, farmId) => {
  if (user.role === 'admin') return true;
  return user.farmId && user.farmId.toString() === farmId.toString();
};

/**
 * @desc    Get thresholds for a farm
 * @route   GET /api/thresholds
 * @access  Private
 */
exports.getThresholds = async (req, res, next) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm thresholds', 'FORBIDDEN', 403);
    }

    let thresholds = await Threshold.findOne({ farmId })
      .populate('updatedBy', 'name');

    // If none exists, return defaults (do not write to DB on GET to avoid side effects)
    if (!thresholds) {
      thresholds = {
        farmId,
        minMoisture: 30,
        maxMoisture: 70,
        maxTemperature: 35,
        minHumidity: 20
      };
    }

    return success(res, thresholds, 'Thresholds fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create or update thresholds for a farm (upsert)
 * @route   PUT /api/thresholds
 * @access  Private (Farmer, Admin)
 */
exports.upsertThresholds = async (req, res, next) => {
  try {
    const { farmId, minMoisture, maxMoisture, maxTemperature, minHumidity } = req.body;

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to modify thresholds on this farm', 'FORBIDDEN', 403);
    }

    const farm = await Farm.findById(farmId);
    if (!farm || !farm.isActive) {
      return error(res, 'Farm not found or inactive', 'FARM_INACTIVE', 400);
    }

    // Upsert
    const thresholds = await Threshold.findOneAndUpdate(
      { farmId },
      {
        minMoisture,
        maxMoisture,
        maxTemperature,
        minHumidity,
        updatedBy: req.user._id
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('updatedBy', 'name');

    return success(res, thresholds, 'Thresholds updated successfully');
  } catch (err) {
    next(err);
  }
};
