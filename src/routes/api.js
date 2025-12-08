const courseController = require('../controllers/courseController');
const contentController = require('../controllers/contentController');
const progressController = require('../controllers/progressController');

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

// GET /api/content/:topicId - Get topic content
router.get('/content/:topicId(*)', (req, res) => contentController.getTopicContent(req, res));

// GET /api/content/:topicId/raw - Get raw markdown
router.get('/content/:topicId(*)/raw', (req, res) => contentController.getRawContent(req, res));

// GET /api/content/:topicId/evaluation - Get evaluation markdown
router.get('/content/:topicId(*)/evaluation', (req, res) => contentController.getTopicEvaluation(req, res));

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
