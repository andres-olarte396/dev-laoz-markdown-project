/**
 * L4OZ Learning Platform Server
 * Main server file for the Learning Management System
 */

const express = require('express');
const cors = require('cors');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import services and utilities
const logger = require('./src/utils/logger');
const dbService = require('./src/services/dbService');
const courseService = require('./src/services/courseService');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import routes
const apiRoutes = require('./src/routes/api');
const menuRoutes = require('./src/routes/menuRoutes'); // Legacy support
const fileRoutes = require('./src/routes/fileRoutes'); // Legacy support

// Parse command line arguments
const args = minimist(process.argv.slice(2), {
    default: {
        port: process.env.PORT || 7000,
        dir: './public'
    }
});

const PORT = args.port;
const HTML_DIRECTORY = path.resolve(path.join(__dirname, './src/views'));
const CONTENT_DIRECTORY = path.resolve(path.join(__dirname, args.dir || './public'));

// Ensure directories exist
[HTML_DIRECTORY, CONTENT_DIRECTORY, path.join(__dirname, 'logs'), path.join(__dirname, 'db')].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// Serve static files
app.use('/app', express.static(HTML_DIRECTORY));
app.use('/content', express.static(path.join(__dirname, 'public/content')));

// ============================================
// ROUTES
// ============================================

// New API routes
app.use('/api', apiRoutes);

// Legacy routes (for backward compatibility)
app.use('/api/menu', menuRoutes);
app.use('/api/files', fileRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'L4OZ Learning Platform',
        version: '2.0.0',
        description: 'Learning Management System for teach-laoz courses',
        endpoints: {
            health: '/api/health',
            courses: '/api/courses',
            app: '/app',
            docs: '/api/docs'
        }
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================

async function startServer() {
    try {
        logger.info('='.repeat(60));
        logger.info('L4OZ Learning Platform - Starting...');
        logger.info('='.repeat(60));

        // Initialize database
        logger.info('Initializing database...');
        await dbService.init();
        logger.info('✓ Database ready');

        // Scan courses on startup
        logger.info('Scanning for courses...');
        const courses = await courseService.scanCourses();
        logger.info(`✓ Found ${courses.length} courses`);

        // Start server
        app.listen(PORT, () => {
            logger.info('='.repeat(60));
            logger.info(`✓ Server running on http://localhost:${PORT}`);
            logger.info('='.repeat(60));
            logger.info('\nAvailable endpoints:');
            logger.info(`  • Web App:        http://localhost:${PORT}/app`);
            logger.info(`  • API:            http://localhost:${PORT}/api`);
            logger.info(`  • Health Check:   http://localhost:${PORT}/api/health`);
            logger.info(`  • Courses:        http://localhost:${PORT}/api/courses`);
            logger.info('='.repeat(60));
            
            if (courses.length > 0) {
                logger.info('\nIndexed courses:');
                courses.forEach((course, index) => {
                    logger.info(`  ${index + 1}. ${course.title}`);
                });
            }
            
            logger.info('\n' + '='.repeat(60));
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            logger.info('\nShutting down gracefully...');
            dbService.close();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            logger.info('\nShutting down gracefully...');
            dbService.close();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
