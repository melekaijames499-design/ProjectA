const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this resource',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'User account is deactivated',
        code: 'DEACTIVATED_USER'
      });
    }

    // Attach user profile to request object
    req.user = user;
    next();
  } catch (error) {
    let message = 'Not authorized to access this resource';
    let code = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
      code = 'TOKEN_EXPIRED';
    }

    return res.status(401).json({
      success: false,
      error: message,
      code
    });
  }
};

module.exports = { protect };
