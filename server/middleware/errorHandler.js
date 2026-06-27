const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const fields = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error:   'Validation failed',
      code:    'VALIDATION_ERROR',
      fields,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error:   `${field} already exists`,
      code:    'DUPLICATE_KEY',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error:   'Invalid token',
      code:    'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error:   'Token expired',
      code:    'TOKEN_EXPIRED',
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    error:   err.message || 'Internal server error',
    code:    err.code    || 'SERVER_ERROR',
  });
};

module.exports = errorHandler;
