const Schedule = require('../models/Schedule');
const Farm = require('../models/Farm');
const { success, error } = require('../utils/apiResponse');

// Check access helper
const checkFarmAccess = (user, farmId) => {
  if (user.role === 'admin') return true;
  return user.farmId && user.farmId.toString() === farmId.toString();
};

/**
 * @desc    Get all schedules for a farm
 * @route   GET /api/schedules
 * @access  Private
 */
exports.getSchedules = async (req, res, next) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return error(res, 'Farm ID is required', 'FARM_ID_REQUIRED', 400);
    }

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm schedules', 'FORBIDDEN', 403);
    }

    const schedules = await Schedule.find({ farmId })
      .populate('createdBy', 'name')
      .sort({ startTime: 1 });

    return success(res, schedules, 'Schedules fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create irrigation schedule
 * @route   POST /api/schedules
 * @access  Private (Farmer, Admin)
 */
exports.createSchedule = async (req, res, next) => {
  try {
    const { farmId, startTime, duration, daysOfWeek } = req.body;

    if (!checkFarmAccess(req.user, farmId)) {
      return error(res, 'Access denied to this farm schedule creation', 'FORBIDDEN', 403);
    }

    const farm = await Farm.findById(farmId);
    if (!farm || !farm.isActive) {
      return error(res, 'Farm not found or inactive', 'FARM_INACTIVE', 400);
    }

    const schedule = await Schedule.create({
      farmId,
      createdBy: req.user._id,
      startTime,
      duration,
      daysOfWeek,
      isActive: true
    });

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('createdBy', 'name');

    return success(res, populatedSchedule, 'Schedule created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Edit irrigation schedule
 * @route   PUT /api/schedules/:id
 * @access  Private (Farmer, Admin)
 */
exports.updateSchedule = async (req, res, next) => {
  try {
    const { startTime, duration, daysOfWeek, isActive } = req.body;
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return error(res, 'Schedule not found', 'SCHEDULE_NOT_FOUND', 404);
    }

    if (!checkFarmAccess(req.user, schedule.farmId)) {
      return error(res, 'Access denied to this farm schedule modification', 'FORBIDDEN', 403);
    }

    if (startTime) schedule.startTime = startTime;
    if (duration) schedule.duration = duration;
    if (daysOfWeek) schedule.daysOfWeek = daysOfWeek;
    if (typeof isActive === 'boolean') schedule.isActive = isActive;

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('createdBy', 'name');

    return success(res, populatedSchedule, 'Schedule updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete irrigation schedule
 * @route   DELETE /api/schedules/:id
 * @access  Private (Farmer, Admin)
 */
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return error(res, 'Schedule not found', 'SCHEDULE_NOT_FOUND', 404);
    }

    if (!checkFarmAccess(req.user, schedule.farmId)) {
      return error(res, 'Access denied to this farm schedule deletion', 'FORBIDDEN', 403);
    }

    await Schedule.findByIdAndDelete(req.params.id);

    return success(res, null, 'Schedule deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle schedule isActive status
 * @route   PATCH /api/schedules/:id/toggle
 * @access  Private (Farmer, Admin)
 */
exports.toggleSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return error(res, 'Schedule not found', 'SCHEDULE_NOT_FOUND', 404);
    }

    if (!checkFarmAccess(req.user, schedule.farmId)) {
      return error(res, 'Access denied to this farm schedule toggle', 'FORBIDDEN', 403);
    }

    schedule.isActive = !schedule.isActive;
    await schedule.save();

    return success(res, schedule, `Schedule ${schedule.isActive ? 'enabled' : 'disabled'} successfully`);
  } catch (err) {
    next(err);
  }
};
