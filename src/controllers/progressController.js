/**
 * Progress Controller
 * Handles HTTP requests for user progress tracking
 */

const dbService = require('../services/dbService');
const logger = require('../utils/logger');

class ProgressController {
    /**
     * GET /api/progress/:courseId
     * Get user progress for a course
     */
    async getCourseProgress(req, res) {
        try {
            const { courseId } = req.params;
            const userId = req.userId || 1; // Default to guest user
            
            const progress = await dbService.getUserProgress(userId, courseId);
            const stats = await dbService.getCourseStats(userId, courseId);
            
            res.json({
                success: true,
                data: {
                    progress: progress,
                    stats: stats
                }
            });
        } catch (error) {
            logger.error('Error getting progress:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve progress'
            });
        }
    }

    /**
     * GET /api/progress/topic/:topicId
     * Get progress for a specific topic
     */
    async getTopicProgress(req, res) {
        try {
            const topicId = decodeURIComponent(req.params.topicId);
            const userId = req.userId || 1;
            
            const progress = await dbService.getTopicProgress(userId, topicId);
            
            res.json({
                success: true,
                data: progress || { completed: false, last_position: 0 }
            });
        } catch (error) {
            logger.error('Error getting topic progress:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve topic progress'
            });
        }
    }

    /**
     * POST /api/progress/mark-complete
     * Mark a topic as completed
     */
    async markComplete(req, res) {
        try {
            const { courseId, moduleId, topicId } = req.body;
            const userId = req.userId || 1;
            
            if (!courseId || !moduleId || !topicId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: courseId, moduleId, topicId'
                });
            }

            await dbService.markTopicCompleted(userId, courseId, moduleId, topicId);
            
            res.json({
                success: true,
                message: 'Topic marked as completed'
            });
        } catch (error) {
            logger.error('Error marking topic complete:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to mark topic as completed'
            });
        }
    }

    /**
     * POST /api/progress/update-position
     * Update progress position (audio/scroll)
     */
    async updatePosition(req, res) {
        try {
            const { topicId, position, timeSpent } = req.body;
            const userId = req.userId || 1;
            
            if (!topicId || position === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: topicId, position'
                });
            }

            await dbService.updateProgressPosition(userId, topicId, position, timeSpent || 0);
            
            res.json({
                success: true,
                message: 'Progress position updated'
            });
        } catch (error) {
            logger.error('Error updating position:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update progress position'
            });
        }
    }

    /**
     * GET /api/progress/:courseId/stats
     * Get detailed statistics for a course
     */
    async getCourseStats(req, res) {
        try {
            const { courseId } = req.params;
            const userId = req.userId || 1;
            
            const stats = await dbService.getCourseStats(userId, courseId);
            
            // Calculate percentage
            const percentage = stats && stats.total_topics > 0 
                ? (stats.completed_topics / stats.total_topics) * 100 
                : 0;
            
            res.json({
                success: true,
                data: {
                    ...stats,
                    percentage: Math.round(percentage * 100) / 100
                }
            });
        } catch (error) {
            logger.error('Error getting course stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve course statistics'
            });
        }
    }

    /**
     * POST /api/progress/submit-evaluation
     * Submit evaluation results
     */
    async submitEvaluation(req, res) {
        try {
            const { topicId, score, maxScore, answers, timeSpent } = req.body;
            const userId = req.userId || 1;

            if (!topicId || score === undefined || !maxScore) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: topicId, score, maxScore'
                });
            }

            await dbService.saveEvaluationResult(
                userId, 
                topicId, 
                score, 
                maxScore, 
                answers || [], 
                timeSpent || 0
            );

            res.json({
                success: true,
                message: 'Evaluation submitted successfully'
            });

        } catch (error) {
            logger.error('Error submitting evaluation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit evaluation'
            });
        }
    }
}

module.exports = new ProgressController();
