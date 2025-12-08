/**
 * Course Controller
 * Handles HTTP requests for course-related operations
 */

const courseService = require('../services/courseService');
const logger = require('../utils/logger');

class CourseController {
    /**
     * GET /api/courses
     * Get all available courses
     */
    async getAllCourses(req, res) {
        try {
            const courses = await courseService.getAllCourses();
            
            res.json({
                success: true,
                count: courses.length,
                data: courses
            });
        } catch (error) {
            logger.error('Error getting courses:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve courses'
            });
        }
    }

    /**
     * GET /api/courses/:courseId
     * Get course details with full structure
     */
    async getCourseById(req, res) {
        try {
            const { courseId } = req.params;
            const courseStructure = await courseService.getCourseStructure(courseId);
            
            if (!courseStructure) {
                return res.status(404).json({
                    success: false,
                    error: 'Course not found'
                });
            }

            res.json({
                success: true,
                data: courseStructure
            });
        } catch (error) {
            logger.error('Error getting course:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve course'
            });
        }
    }

    /**
     * GET /api/courses/:courseId/structure
     * Get course structure (modules and topics)
     */
    async getCourseStructure(req, res) {
        try {
            const { courseId } = req.params;
            const structure = await courseService.getCourseStructure(courseId);
            
            if (!structure) {
                return res.status(404).json({
                    success: false,
                    error: 'Course not found'
                });
            }

            res.json({
                success: true,
                data: structure
            });
        } catch (error) {
            logger.error('Error getting course structure:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve course structure'
            });
        }
    }

    /**
     * POST /api/courses/scan
     * Scan and refresh course catalog
     */
    async scanCourses(req, res) {
        try {
            logger.info('Manual course scan triggered');
            const courses = await courseService.scanCourses();
            
            res.json({
                success: true,
                message: `Scanned and updated ${courses.length} courses`,
                data: courses
            });
        } catch (error) {
            logger.error('Error scanning courses:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to scan courses'
            });
        }
    }
}

module.exports = new CourseController();
