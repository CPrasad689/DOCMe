import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  }

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};