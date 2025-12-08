/**
 * Database Service
 * Handles SQLite connection and queries
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class DatabaseService {
    constructor() {
        this.dbPath = path.join(__dirname, '../../db/l4oz_learning.db');
        this.schemaPath = path.join(__dirname, '../../db/schema.sql');
        this.db = null;
        this.initialized = false;
    }

    /**
     * Initialize database connection
     */
    init() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure db directory exists
                const dbDir = path.dirname(this.dbPath);
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                this.db = new sqlite3.Database(this.dbPath, async (err) => {
                    if (err) {
                        logger.error('Could not connect to database:', err);
                        reject(err);
                        return;
                    }
                    
                    logger.info(`Database initialized at ${this.dbPath}`);
                    
                    try {
                        // Enable foreign keys
                        await this.run('PRAGMA foreign_keys = ON');
                        
                        // Run schema
                        await this.runSchema();
                        
                        this.initialized = true;
                        resolve(this.db);
                    } catch (error) {
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error('Failed to initialize database:', error);
                reject(error);
            }
        });
    }

    /**
     * Run schema SQL file
     */
    async runSchema() {
        if (!fs.existsSync(this.schemaPath)) {
            logger.warn('Schema file not found, skipping schema initialization');
            return;
        }

        const schema = fs.readFileSync(this.schemaPath, 'utf-8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    logger.error('Failed to run schema:', err);
                    reject(err);
                    return;
                }
                logger.info('Database schema applied successfully');
                resolve();
            });
        });
    }

    /**
     * Helper: Run a query
     */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    /**
     * Helper: Get single row
     */
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Helper: Get all rows
     */
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            logger.info('Database connection closed');
            this.initialized = false;
        }
    }

    // ============================================
    // USERS
    // ============================================

    async getUserById(userId) {
        return this.get('SELECT * FROM users WHERE id = ?', [userId]);
    }

    async getUserByUsername(username) {
        return this.get('SELECT * FROM users WHERE username = ?', [username]);
    }

    async createUser(username, email, displayName) {
        const result = await this.run(
            'INSERT INTO users (username, email, display_name) VALUES (?, ?, ?)',
            [username, email, displayName]
        );
        return result.lastID;
    }

    // ============================================
    // COURSES
    // ============================================

    async getAllCourses() {
        return this.all('SELECT * FROM courses ORDER BY title');
    }

    async getCourseById(courseId) {
        return this.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    }

    async upsertCourse(courseData) {
        return this.run(`
            INSERT OR REPLACE INTO courses (id, title, description, level, duration_hours, total_modules, author, version, cover_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            courseData.id,
            courseData.title,
            courseData.description,
            courseData.level,
            courseData.duration_hours,
            courseData.total_modules,
            courseData.author,
            courseData.version,
            courseData.cover_image
        ]);
    }

    // ============================================
    // MODULES
    // ============================================

    async getModulesByCourse(courseId) {
        return this.all(
            'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index',
            [courseId]
        );
    }

    async upsertModule(moduleData) {
        // Try INSERT first, if fails due to constraint, try UPDATE
        try {
            return await this.run(`
                INSERT INTO modules (id, course_id, module_number, title, description, order_index)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                moduleData.id,
                moduleData.course_id,
                moduleData.module_number,
                moduleData.title,
                moduleData.description,
                moduleData.order_index
            ]);
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return await this.run(`
                    UPDATE modules 
                    SET title = ?, description = ?, order_index = ?
                    WHERE id = ?
                `, [
                    moduleData.title,
                    moduleData.description,
                    moduleData.order_index,
                    moduleData.id
                ]);
            }
            throw err;
        }
    }

    // ============================================
    // TOPICS
    // ============================================

    async getTopicsByModule(moduleId) {
        return this.all(
            'SELECT * FROM topics WHERE module_id = ? ORDER BY order_index',
            [moduleId]
        );
    }

    async getTopicById(topicId) {
        return this.get('SELECT * FROM topics WHERE id = ?', [topicId]);
    }

    async upsertTopic(topicData) {
        const sql = `
            INSERT INTO topics (id, module_id, title, file_path, audio_path, evaluation_path, order_index, estimated_minutes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                file_path = excluded.file_path,
                audio_path = excluded.audio_path,
                evaluation_path = excluded.evaluation_path,
                order_index = excluded.order_index,
                estimated_minutes = excluded.estimated_minutes
        `;
        
        return this.run(sql, [
            topicData.id,
            topicData.module_id,
            topicData.title,
            topicData.file_path,
            topicData.audio_path,
            topicData.evaluation_path,
            topicData.order_index,
            topicData.estimated_minutes
        ]);
    }

    // ============================================
    // PROGRESS
    // ============================================

    async getUserProgress(userId, courseId) {
        return this.all(
            'SELECT * FROM progress WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
    }

    async getTopicProgress(userId, topicId) {
        return this.get(
            'SELECT * FROM progress WHERE user_id = ? AND topic_id = ?',
            [userId, topicId]
        );
    }

    async markTopicCompleted(userId, courseId, moduleId, topicId) {
        return this.run(`
            INSERT OR REPLACE INTO progress (user_id, course_id, module_id, topic_id, completed, completed_at, updated_at)
            VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [userId, courseId, moduleId, topicId]);
    }

    async updateProgressPosition(userId, topicId, position, timeSpent) {
        // First get existing time
        const existing = await this.getTopicProgress(userId, topicId);
        const totalTime = (existing?.time_spent_seconds || 0) + timeSpent;
        
        return this.run(`
            INSERT OR REPLACE INTO progress (user_id, topic_id, last_position, time_spent_seconds, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [userId, topicId, position, totalTime]);
    }

    async getCourseStats(userId, courseId) {
        return this.get(`
            SELECT 
                COUNT(DISTINCT t.id) as total_topics,
                COUNT(DISTINCT CASE WHEN p.completed = 1 THEN t.id END) as completed_topics,
                COUNT(DISTINCT t.module_id) as total_modules,
                COUNT(DISTINCT CASE WHEN p.completed = 1 THEN t.module_id END) as completed_modules,
                SUM(p.time_spent_seconds) as total_time_seconds
            FROM topics t
            LEFT JOIN progress p ON t.id = p.topic_id AND p.user_id = ?
            JOIN modules m ON t.module_id = m.id
            WHERE m.course_id = ?
        `, [userId, courseId]);
    }

    // ============================================
    // EVALUATIONS
    // ============================================

    async getEvaluationById(evaluationId) {
        return this.get('SELECT * FROM evaluations WHERE id = ?', [evaluationId]);
    }

    async saveEvaluationResult(userId, topicId, score, maxScore, answers, timeSpent) {
        const percentage = (score / maxScore) * 100;
        const passed = percentage >= 70; // Umbral fijo del 70% por ahora
        
        // Get attempt number
        const attemptData = await this.get(`
            SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
            FROM evaluation_results
            WHERE user_id = ? AND topic_id = ?
        `, [userId, topicId]);
        
        const nextAttempt = attemptData?.next_attempt || 1;
        
        return this.run(`
            INSERT INTO evaluation_results 
            (user_id, topic_id, score, max_score, percentage, answers, time_spent_seconds, passed, attempt_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            topicId,
            score,
            maxScore,
            percentage,
            JSON.stringify(answers),
            timeSpent,
            passed ? 1 : 0,
            nextAttempt
        ]);
    }

    async getUserEvaluationResults(userId, topicId) {
        return this.all(`
            SELECT * FROM evaluation_results
            WHERE user_id = ? AND topic_id = ?
            ORDER BY submitted_at DESC
        `, [userId, topicId]);
    }

    // ============================================
    // BOOKMARKS
    // ============================================

    async addBookmark(userId, topicId, note = null) {
        return this.run(`
            INSERT OR REPLACE INTO bookmarks (user_id, topic_id, note)
            VALUES (?, ?, ?)
        `, [userId, topicId, note]);
    }

    async removeBookmark(userId, topicId) {
        return this.run(
            'DELETE FROM bookmarks WHERE user_id = ? AND topic_id = ?',
            [userId, topicId]
        );
    }

    async getUserBookmarks(userId) {
        return this.all(`
            SELECT b.*, t.title, t.file_path, m.title as module_title
            FROM bookmarks b
            JOIN topics t ON b.topic_id = t.id
            JOIN modules m ON t.module_id = m.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [userId]);
    }

    // ============================================
    // USER SETTINGS
    // ============================================

    async getUserSettings(userId) {
        return this.get('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    }

    async updateUserSettings(userId, settings) {
        return this.run(`
            INSERT OR REPLACE INTO user_settings (user_id, theme, font_size, audio_speed, auto_play, preferences)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            userId,
            settings.theme,
            settings.font_size,
            settings.audio_speed,
            settings.auto_play,
            JSON.stringify(settings.preferences || {})
        ]);
    }
}

// Export singleton instance
module.exports = new DatabaseService();
