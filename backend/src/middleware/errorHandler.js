const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);

  // PostgreSQL unique violation error
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record already exists with the given unique values.',
      detail: err.detail,
    });
  }

  // PostgreSQL foreign key violation error
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced related record does not exist or cannot be modified.',
      detail: err.detail,
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Data constraint validation failed.',
      detail: err.detail,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
