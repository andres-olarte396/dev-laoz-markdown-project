const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const contentController = require('../controllers/contentController');
const progressController = require('../controllers/progressController');
const fileTreeService = require('../services/fileTreeService');
const path = require('path');
const fs = require('fs');

// ============================================
// MENU / FILE TREE ROUTES
// ============================================
router.get('/menu', (req, res) => {
    try {
        const tree = fileTreeService.getMenu();
        res.json({ data: tree });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate menu' });
    }
});

router.get('/file/:path(*)', (req, res) => {
    try {
        // Prevent directory traversal
        const safePath = path.normalize(req.params.path).replace(/^(\.\.[\/\\])+/, '');
        const fullPath = path.join(__dirname, '../../public', safePath);
        
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            res.sendFile(fullPath);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// COURSE ROUTES
// ============================================

// GET /api/courses - Get all courses
router.get('/courses', (req, res) => courseController.getAllCourses(req, res));

// GET /api/courses/:courseId - Get course details
router.get('/courses/:courseId', (req, res) => courseController.getCourseById(req, res));

// GET /api/courses/:courseId/structure - Get course structure
router.get('/courses/:courseId/structure', (req, res) => courseController.getCourseStructure(req, res));

// POST /api/courses/scan - Scan and refresh courses
router.post('/courses/scan', (req, res) => courseController.scanCourses(req, res));

// ============================================
// CONTENT ROUTES
// ============================================

// GET /api/content/:topicId/evaluation - Get evaluation markdown
router.get('/content/:topicId(*)/evaluation', (req, res) => contentController.getTopicEvaluation(req, res));

// GET /api/content/:topicId/raw - Get raw markdown
router.get('/content/:topicId(*)/raw', (req, res) => contentController.getRawContent(req, res));

// GET /api/content/:topicId - Get topic content
router.get('/content/:topicId(*)', (req, res) => contentController.getTopicContent(req, res));

// GET /api/audio/:topicId - Stream audio file
router.get('/audio/:topicId(*)', (req, res) => contentController.getTopicAudio(req, res));

// ============================================
// PROGRESS ROUTES
// ============================================

// GET /api/progress/:courseId - Get course progress
router.get('/progress/:courseId', (req, res) => progressController.getCourseProgress(req, res));

// GET /api/progress/topic/:topicId - Get topic progress
router.get('/progress/topic/:topicId(*)', (req, res) => progressController.getTopicProgress(req, res));

// GET /api/progress/:courseId/stats - Get course statistics
router.get('/progress/:courseId/stats', (req, res) => progressController.getCourseStats(req, res));

// Helper to get topic info by path (for bridging File Explorer and LMS features)
router.get('/topic-by-path', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) return res.status(400).json({ error: 'Missing path' });
        
        // Normalizar path de la query para coincidir con DB (windows styles)
        // DB stores 'course\module\topic.md' usually relative to content dir
        
        // Try exact match first
        const dbService = require('../services/dbService');
        let topic = await dbService.get('SELECT * FROM topics WHERE file_path = ?', [filePath]);
        
        // Try with backslashes if not found
        if (!topic) {
             const winPath = filePath.replace(/\//g, '\\');
             topic = await dbService.get('SELECT * FROM topics WHERE file_path = ?', [winPath]);
        }

        res.json({ data: topic || null });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/progress/mark-complete - Mark topic as completed
router.post('/progress/mark-complete', (req, res) => progressController.markComplete(req, res));

// POST /api/progress/update-position - Update progress position
router.post('/progress/update-position', (req, res) => progressController.updatePosition(req, res));

// POST /api/progress/submit-evaluation - Submit evaluation results
router.post('/progress/submit-evaluation', (req, res) => progressController.submitEvaluation(req, res));

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

module.exports = router;
