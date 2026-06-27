const User = require('../models/User');
const Farm = require('../models/Farm');
const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const PumpLog = require('../models/PumpLog');
const { success, error, paginated } = require('../utils/apiResponse');

/**
 * @desc    Get all users (paginated, filterable by role)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('farmId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return paginated(res, users, page, limit, total, 'Users fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a user with any role
 * @route   POST /api/admin/users
 * @access  Private (Admin only)
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, farmId } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return error(res, 'Email already registered', 'EMAIL_IN_USE', 400);
    }

    const assignedFarmId = farmId && farmId !== 'null' && farmId !== '' ? farmId : null;

    const user = await User.create({
      name,
      email,
      password,
      role,
      farmId: assignedFarmId
    });

    // If farm owner was assigned, make sure they are linked if not already
    if (assignedFarmId && role === 'farmer') {
      await Farm.findByIdAndUpdate(assignedFarmId, { owner: user._id });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmId: user.farmId,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return success(res, userResponse, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Edit user details (role, isActive, farmId assignment)
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, farmId } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return error(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return error(res, 'Email already registered', 'EMAIL_IN_USE', 400);
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    const assignedFarmId = farmId && farmId !== 'null' && farmId !== '' ? farmId : null;
    user.farmId = assignedFarmId;

    await user.save();

    // If farm owner was assigned, update that farm's owner
    if (assignedFarmId && role === 'farmer') {
      await Farm.findByIdAndUpdate(assignedFarmId, { owner: user._id });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmId: user.farmId,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    };

    return success(res, userResponse, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Deactivate user (soft delete)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Don't let admins delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return error(res, 'You cannot deactivate your own account', 'SELF_DEACTIVATION', 400);
    }

    user.isActive = false;
    await user.save();

    return success(res, null, 'User account deactivated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    List all farms
 * @route   GET /api/admin/farms
 * @access  Private (Admin only)
 */
exports.getFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return success(res, farms, 'Farms fetched successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create farm
 * @route   POST /api/admin/farms
 * @access  Private (Admin only)
 */
exports.createFarm = async (req, res, next) => {
  try {
    const { name, location, owner, area, cropType } = req.body;

    // Verify owner exists and is a farmer/admin
    const user = await User.findById(owner);
    if (!user) {
      return error(res, 'Owner user not found', 'OWNER_NOT_FOUND', 404);
    }

    const farm = await Farm.create({
      name,
      location,
      owner,
      area,
      cropType
    });

    // Update user's farmId
    user.farmId = farm._id;
    await user.save();

    return success(res, farm, 'Farm created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Edit farm details
 * @route   PUT /api/admin/farms/:id
 * @access  Private (Admin only)
 */
exports.updateFarm = async (req, res, next) => {
  try {
    const { name, location, owner, area, cropType, isActive } = req.body;
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return error(res, 'Farm not found', 'FARM_NOT_FOUND', 404);
    }

    if (name) farm.name = name;
    if (location) farm.location = location;
    if (area) farm.area = area;
    if (cropType) farm.cropType = cropType;
    if (typeof isActive === 'boolean') farm.isActive = isActive;

    if (owner && owner !== farm.owner.toString()) {
      const newOwner = await User.findById(owner);
      if (!newOwner) {
        return error(res, 'New owner not found', 'OWNER_NOT_FOUND', 404);
      }

      // Unassign old owner's farmId if matches
      await User.findOneAndUpdate(
        { farmId: farm._id, role: 'farmer' },
        { farmId: null }
      );

      farm.owner = owner;
      newOwner.farmId = farm._id;
      await newOwner.save();
    }

    await farm.save();

    return success(res, farm, 'Farm updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Deactivate farm (soft delete)
 * @route   DELETE /api/admin/farms/:id
 * @access  Private (Admin only)
 */
exports.deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return error(res, 'Farm not found', 'FARM_NOT_FOUND', 404);
    }

    farm.isActive = false;
    await farm.save();

    return success(res, null, 'Farm deactivated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    System-wide analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalFarms = await Farm.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const readingsToday = await SensorReading.countDocuments({
      timestamp: { $gte: startOfToday }
    });
    const activeAlerts = await Alert.countDocuments({ isResolved: false });

    // Readings submitted per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const readingsOverTime = await SensorReading.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Alerts by farm
    const alertsByFarm = await Alert.aggregate([
      {
        $group: {
          _id: '$farmId',
          count: { $sum: 1 }
        }
      }
    ]);
    const populatedAlertsByFarm = await Farm.populate(alertsByFarm, {
      path: '_id',
      select: 'name'
    });

    const alertChartData = populatedAlertsByFarm
      .filter(item => item._id) // filter out nulls if any
      .map(item => ({
        farmName: item._id.name,
        count: item.count
      }));

    // Pump usage by farm (hours ON in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pumpUsageLogs = await PumpLog.find({
      timestamp: { $gte: sevenDaysAgo },
      action: 'ON',
      duration: { $ne: null }
    }).populate('farmId', 'name');

    const farmPumpMap = {};
    pumpUsageLogs.forEach(log => {
      if (!log.farmId) return;
      const farmName = log.farmId.name;
      const durationHours = log.duration / 60; // duration is in minutes
      farmPumpMap[farmName] = (farmPumpMap[farmName] || 0) + durationHours;
    });

    const pumpChartData = Object.keys(farmPumpMap).map(name => ({
      farmName: name,
      hoursOn: parseFloat(farmPumpMap[name].toFixed(2))
    }));

    return success(res, {
      summary: {
        totalFarms,
        totalUsers,
        readingsToday,
        activeAlerts
      },
      readingsChart: readingsOverTime.map(item => ({
        date: item._id,
        count: item.count
      })),
      alertsChart: alertChartData,
      pumpChart: pumpChartData
    }, 'Analytics compiled successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    All alerts across all farms
 * @route   GET /api/admin/alerts
 * @access  Private (Admin only)
 */
exports.getAllAlerts = async (req, res, next) => {
  try {
    const { isResolved, severity, farmId } = req.query;
    const query = {};

    if (isResolved !== undefined && isResolved !== 'all') {
      query.isResolved = isResolved === 'true';
    }

    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    if (farmId && farmId !== 'all') {
      query.farmId = farmId;
    }

    const alerts = await Alert.find(query)
      .populate('farmId', 'name location')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    return success(res, alerts, 'Alerts fetched successfully');
  } catch (err) {
    next(err);
  }
};
