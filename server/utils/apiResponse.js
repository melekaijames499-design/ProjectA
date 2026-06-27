/**
 * Format success response
 */
exports.success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Format error response
 */
exports.error = (res, errorMsg = 'Error occurred', code = 'ERROR', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: errorMsg,
    code
  });
};

/**
 * Format paginated success response
 */
exports.paginated = (res, data = [], page = 1, limit = 20, total = 0, message = 'Success') => {
  const pages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    message,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages
    }
  });
};
