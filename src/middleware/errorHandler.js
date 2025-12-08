/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
    // Log error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Determine status code
    const statusCode = err.statusCode || 500;
    
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
        path: req.url
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
