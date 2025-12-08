/**
 * Database Initialization Script
 * Initializes database and scans courses
 */

const dbService = require('../src/services/dbService');
const courseService = require('../src/services/courseService');
const logger = require('../src/utils/logger');

async function initializeDatabase() {
    try {
        logger.info('='.repeat(50));
        logger.info('Starting database initialization...');
        logger.info('='.repeat(50));

        // Initialize database
        logger.info('Step 1: Initializing database connection...');
        await dbService.init(); // Changed from initialize() to init()
        logger.info('✓ Database initialized successfully');

        // Scan courses
        logger.info('\nStep 2: Scanning for courses...');
        const courses = await courseService.scanCourses();
        logger.info(`✓ Found and indexed ${courses.length} courses`);

        // Display summary
        logger.info('\n' + '='.repeat(50));
        logger.info('Database initialization complete!');
        logger.info('='.repeat(50));
        
        if (courses.length > 0) {
            logger.info('\nCourses indexed:');
            courses.forEach((course, index) => {
                logger.info(`  ${index + 1}. ${course.title} (${course.total_modules} modules)`);
            });
        } else {
            logger.warn('\nNo courses found. Make sure teach-laoz courses are in public/content/');
        }

        logger.info('\nYou can now start the server with: npm start');
        
        process.exit(0);
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();
