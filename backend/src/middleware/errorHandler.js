import logger from '../utils/logger.js';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: err.stack
  });

  // Default error
  let error = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      details: null
    },
    timestamp: new Date().toISOString()
  };

  // Handle custom AppError
  if (err instanceof AppError) {
    error.error = {
      code: err.code,
      message: err.message,
      details: err.details
    };
    return res.status(err.statusCode).json(error);
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError' || err.isJoi) {
    error.error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.details?.map(d => ({
        field: d.path.join('.'),
        message: d.message
      })) || [{ message: err.message }]
    };
    return res.status(400).json(error);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = {
      code: 'INVALID_TOKEN',
      message: 'Invalid or malformed JWT token'
    };
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = {
      code: 'TOKEN_EXPIRED',
      message: 'Token has expired'
    };
    return res.status(401).json(error);
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.error = {
      code: 'DUPLICATE_ENTRY',
      message: `${err.fields?.[0] || 'Field'} already exists`,
      details: { field: err.fields?.[0] }
    };
    return res.status(409).json(error);
  }

  if (err.name === 'SequelizeValidationError') {
    error.error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.errors?.map(e => ({
        field: e.path,
        message: e.message
      }))
    };
    return res.status(400).json(error);
  }

  // Handle other errors
  const statusCode = err.statusCode || 500;
  error.error = {
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  };

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    error.error.stack = err.stack?.split('\n');
  }

  return res.status(statusCode).json(error);
};

export default errorHandler;
