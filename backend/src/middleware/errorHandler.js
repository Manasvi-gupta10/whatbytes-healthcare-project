// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    const message = err.errors && err.errors[0] ? err.errors[0].message : 'Duplicate entry error';
    return res.status(400).json({
      success: false,
      message,
      field,
    });
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    return res.status(400).json({
      success: false,
      message: messages[0],
      errors: messages,
    });
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist or has active associations.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired.',
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
