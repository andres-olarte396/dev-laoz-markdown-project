/**
 * Content Controller
 * Handles HTTP requests for content and audio files
 */

const courseService = require('../services/courseService');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ContentController {
    /**
     * GET /api/content/:topicId
     * Get markdown content for a topic
     */
    async getTopicContent(req, res) {
        try {
            const topicId = decodeURIComponent(req.params.topicId);
            const topicData = await courseService.getTopicContent(topicId);
            
            if (!topicData) {
                return res.status(404).json({
                    success: false,
                    error: 'Topic not found'
                });
            }

            res.json({
                success: true,
                data: topicData
            });
        } catch (error) {
            logger.error('Error getting topic content:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve content'
            });
        }
    }

    /**
     * GET /api/audio/:topicId
     * Stream audio file for a topic
     */
    async getTopicAudio(req, res) {
        try {
            const topicId = decodeURIComponent(req.params.topicId);
            const audioPath = await courseService.getAudioPath(topicId);
            
            if (!audioPath || !fs.existsSync(audioPath)) {
                return res.status(404).json({
                    success: false,
                    error: 'Audio file not found'
                });
            }

            // Get file stats
            const stat = fs.statSync(audioPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            // Support range requests for audio streaming
            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(audioPath, { start, end });
                
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg',
                };
                
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'audio/mpeg',
                };
                
                res.writeHead(200, head);
                fs.createReadStream(audioPath).pipe(res);
            }
        } catch (error) {
            logger.error('Error streaming audio:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to stream audio'
            });
        }
    }

    /**
     * GET /api/content/:topicId/evaluation
     * Get evaluation markdown for a topic
     */
    async getTopicEvaluation(req, res) {
        try {
            const topicId = decodeURIComponent(req.params.topicId);
            logger.info(`Requested evaluation for topicId: ${topicId}`);

            const topicData = await courseService.getTopicById(topicId); // Get topic first to debug
            if (!topicData) {
                 logger.warn(`Topic not found in DB: ${topicId}`);
                 return res.status(404).json({ error: 'Topic not found' });
            }

            if (!topicData.evaluation_path) {
                logger.warn(`Topic has no evaluation_path: ${topicId}`);
                return res.status(404).json({ error: 'Evaluation not linked to topic' });
            }
            
            logger.info(`Found evaluation path: ${topicData.evaluation_path}`);

            const content = await courseService.getEvaluationContent(topicId);
            
            if (!content) {
                logger.warn(`Evaluation file missing at path: ${topicData.evaluation_path}`);
                return res.status(404).json({
                    success: false,
                    error: 'Evaluation file not found on disk'
                });
            }

            res.json({
                success: true,
                markdown: content
            });
        } catch (error) {
            logger.error('Error getting evaluation content:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve evaluation'
            });
        }
    }

    /**
     * GET /api/content/:topicId/raw
     * Get raw markdown content (for editing/preview)
     */
    async getRawContent(req, res) {
        try {
            const topicId = decodeURIComponent(req.params.topicId);
            const topicData = await courseService.getTopicContent(topicId);
            
            if (!topicData) {
                return res.status(404).json({
                    success: false,
                    error: 'Topic not found'
                });
            }

            res.set('Content-Type', 'text/markdown');
            res.send(topicData.content);
        } catch (error) {
            logger.error('Error getting raw content:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve content'
            });
        }
    }
}

module.exports = new ContentController();
