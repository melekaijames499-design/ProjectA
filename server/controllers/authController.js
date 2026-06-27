const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { success, error } = require('../utils/apiResponse');

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, farmId: user.farmId },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res, token) => {
  const expiryMs = 7 * 24 * 60 * 60 * 1000; // 7 days matching JWT_REFRESH_EXPIRY
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    // 'strict' blocks the cookie on cross-port dev requests (Vite :5174 → API :5000)
    // Use 'lax' in development so refresh tokens work; 'strict' in production
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: expiryMs
  });
};

/**
 * @desc    Login user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    if (!user.isActive) {
      return error(res, 'Your account is deactivated', 'DEACTIVATED_USER', 403);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set cookie
    setRefreshTokenCookie(res, refreshToken);

    return success(res, {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmId: user.farmId
      }
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Register a new user (Admin only can set role/farmId, but standard signup maps to farmer)
 * @route   POST /api/auth/register
 * @access  Protected (Admin only based on system specification, or public but Admin assigning roles)
 *          Wait: The system API routes mention:
 *          "POST /api/auth/register → Register new user (admin only can assign roles)"
 *          "POST /api/admin/users → Create user with any role (admin only)"
 *          Let's enforce that anyone can call register but only admin can specify role other than 'farmer'
 *          and farmId, unless register is restricted or public. Let's make register public but role default to 'farmer'
 *          unless requested by an admin.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, farmId, secretCode } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return error(res, 'Email already in use', 'EMAIL_IN_USE', 400);
    }

    // Check if requester is admin if they are trying to assign non-farmer role or a farmId
    let userRole = 'farmer';
    let assignedFarmId = null;

    // We check if token was verified and user is admin
    if (req.user && req.user.role === 'admin') {
      if (role) userRole = role;
      if (farmId && farmId !== 'null') assignedFarmId = farmId;
    } else if (role === 'admin') {
      userRole = 'admin';
    } else if (role && role !== 'farmer') {
      return error(res, 'Only administrators can assign roles', 'FORBIDDEN_ROLE_ASSIGNMENT', 403);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      farmId: assignedFarmId
    });

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmId: user.farmId
    }, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return error(res, 'Session expired. Please log in again.', 'REFRESH_TOKEN_NOT_FOUND', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      return error(res, 'Session expired. Please log in again.', 'INVALID_REFRESH_TOKEN', 401);
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 'User no longer exists', 'USER_NOT_FOUND', 401);
    }

    if (!user.isActive) {
      return error(res, 'User account is deactivated', 'DEACTIVATED_USER', 403);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Roll refresh token (optional, but sets new cookie)
    setRefreshTokenCookie(res, tokens.refreshToken);

    return success(res, {
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmId: user.farmId
      }
    }, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user & invalidate refresh cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  return success(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    farmId: req.user.farmId
  });
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmId: user.farmId
    }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};
