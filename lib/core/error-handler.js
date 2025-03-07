// lib/core/error-handler.js
import logger from './logger.js';

class ErrorHandler {
  constructor() {
    this.handle = this.handle.bind(this);
  }

  handle(err, req, res, next) {
    // Log the error
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user ? req.user._id : null
    });

    // Set default status code and message
    let statusCode = err.statusCode || 500;
    let message = process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message || 'Internal server error';
    
    // Customize response based on error type
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) {
      statusCode = 409;
      message = 'Duplicate field value entered';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    // Send error response
    res.status(statusCode).json({
      error: {
        status: statusCode,
        message
      }
    });
  }
}

export default new ErrorHandler();