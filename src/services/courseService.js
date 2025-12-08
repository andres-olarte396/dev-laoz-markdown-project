/**
 * Course Service
 * Handles course discovery, parsing, and management
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const dbService = require('./dbService');

class CourseService {
    constructor() {
        this.contentDir = path.join(__dirname, '../../public/content');
        this.courseCache = new Map();
    }

    /**
     * Scan and discover all teach-laoz courses
     */
    async scanCourses() {
        try {
            logger.info('Scanning for courses...');
            
            if (!fs.existsSync(this.contentDir)) {
                logger.warn(`Content directory not found: ${this.contentDir}`);
                return [];
            }

            const entries = fs.readdirSync(this.contentDir, { withFileTypes: true });
            const courses = [];

            for (const entry of entries) {
                if (entry.isDirectory() && entry.name.startsWith('teach-laoz')) {
                    const coursePath = path.join(this.contentDir, entry.name);
                    const courseData = await this.parseCourse(entry.name, coursePath);
                    
                    if (courseData) {
                        courses.push(courseData);
                        
                        // Save to database
                        await dbService.upsertCourse(courseData);
                        
                        // Parse and save modules
                        await this.parseAndSaveModules(courseData.id, coursePath);
                    }
                }
            }

            logger.info(`Found ${courses.length} courses`);
            return courses;
        } catch (error) {
            logger.error('Error scanning courses:', error);
            throw error;
        }
    }

    /**
     * Parse course metadata
     */
    async parseCourse(courseId, coursePath) {
        try {
            const readmePath = path.join(coursePath, 'README.md');
            const courseJsonPath = path.join(coursePath, 'course.json');
            
            let courseData = {
                id: courseId,
                title: this.formatCourseTitle(courseId),
                description: '',
                level: 'Intermedio',
                duration_hours: 0,
                total_modules: 0,
                author: '',
                version: '1.0.0',
                cover_image: null
            };

            // Try to read course.json first
            if (fs.existsSync(courseJsonPath)) {
                const jsonData = JSON.parse(fs.readFileSync(courseJsonPath, 'utf-8'));
                courseData = { ...courseData, ...jsonData };
            }
            // Otherwise parse README.md
            else if (fs.existsSync(readmePath)) {
                const readme = fs.readFileSync(readmePath, 'utf-8');
                courseData = this.parseReadmeMetadata(readme, courseData);
            }

            // Count modules
            const modulesDir = path.join(coursePath, 'modulos');
            if (fs.existsSync(modulesDir)) {
                const modules = fs.readdirSync(modulesDir, { withFileTypes: true })
                    .filter(entry => entry.isDirectory() && entry.name.startsWith('modulo'));
                courseData.total_modules = modules.length;
            }

            logger.info(`Parsed course: ${courseData.title}`);
            return courseData;
        } catch (error) {
            logger.error(`Error parsing course ${courseId}:`, error);
            return null;
        }
    }

    /**
     * Parse README.md for metadata
     */
    parseReadmeMetadata(readme, defaultData) {
        const lines = readme.split('\n');
        const data = { ...defaultData };

        // Extract title from first heading
        const titleMatch = readme.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            data.title = titleMatch[1].trim();
        }

        // Extract description (first paragraph after title)
        const descMatch = readme.match(/^#.+\n\n(.+?)(\n\n|$)/s);
        if (descMatch) {
            data.description = descMatch[1].trim();
        }

        return data;
    }

    /**
     * Format course ID to readable title
     */
    formatCourseTitle(courseId) {
        return courseId
            .replace('teach-laoz-', '')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Parse and save modules for a course
     */
    async parseAndSaveModules(courseId, coursePath) {
        try {
            console.log(`DEBUG: Parsing modules for ${courseId}`);
            console.log(`DEBUG: Course Path: ${coursePath}`);
            
            const modulesDir = path.join(coursePath, 'modulos');
            console.log(`DEBUG: Checking modules dir: ${modulesDir}`);
            
            if (!fs.existsSync(modulesDir)) {
                console.log(`DEBUG: Modules dir NOT FOUND`);
                logger.warn(`No modules directory found for ${courseId} at ${modulesDir}`);
                return;
            }
            console.log(`DEBUG: Modules dir EXISTS`);

            const moduleEntries = fs.readdirSync(modulesDir, { withFileTypes: true })
                .filter(entry => entry.isDirectory() && entry.name.startsWith('modulo'))
                .sort((a, b) => a.name.localeCompare(b.name));

            logger.info(`Found ${moduleEntries.length} modules for ${courseId}`);

            for (let i = 0; i < moduleEntries.length; i++) {
                const moduleEntry = moduleEntries[i];
                const modulePath = path.join(modulesDir, moduleEntry.name);
                
                // Extract number intelligently (handles 'modulo1', 'modulo_1', 'modulo-1', etc.)
                const numberMatch = moduleEntry.name.match(/modulo[ _-]?(\d+)/i);
                const moduleNumber = numberMatch ? parseInt(numberMatch[1]) : i;
                
                if (isNaN(moduleNumber)) {
                    logger.warn(`Could not parse module number from ${moduleEntry.name}, using index ${i}`);
                }
                
                const moduleData = {
                    id: `${courseId}/${moduleEntry.name}`,
                    course_id: courseId,
                    module_number: moduleNumber,
                    title: await this.getModuleTitle(modulePath),
                    description: '',
                    order_index: i
                };

                logger.info(`Saving module: ${moduleData.id} - ${moduleData.title}`);
                await dbService.upsertModule(moduleData);
                logger.info(`✓ Module saved: ${moduleData.id}`);
                
                // Parse topics
                await this.parseAndSaveTopics(moduleData.id, modulePath);
            }
            
            logger.info(`✓ Completed parsing ${moduleEntries.length} modules for ${courseId}`);
        } catch (error) {
            logger.error(`Error parsing modules for ${courseId}:`, error);
            logger.error('Stack:', error.stack);
        }
    }

    /**
     * Get module title from Presentacion.md
     */
    async getModuleTitle(modulePath) {
        const presentacionPath = path.join(modulePath, 'Presentacion.md');
        
        if (fs.existsSync(presentacionPath)) {
            const content = fs.readFileSync(presentacionPath, 'utf-8');
            const titleMatch = content.match(/^#\s+(.+)$/m);
            if (titleMatch) {
                return titleMatch[1].trim();
            }
        }
        
        // Fallback to directory name
        return path.basename(modulePath).replace('modulo', 'Módulo ');
    }

    /**
     * Parse and save topics for a module
     */
    async parseAndSaveTopics(moduleId, modulePath) {
        try {
            const files = fs.readdirSync(modulePath, { withFileTypes: true })
                .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
                .sort((a, b) => a.name.localeCompare(b.name));

            let orderIndex = 0;

            for (const file of files) {
                const topicId = `${moduleId}/${file.name.replace('.md', '')}`;
                const filePath = path.join(modulePath, file.name);
                
                // Check for associated audio file (mp3 or wav)
                const mp3Name = file.name.replace('.md', '.mp3');
                const wavName = file.name.replace('.md', '.wav');
                
                const mp3Path = path.join(modulePath, mp3Name);
                const wavPath = path.join(modulePath, wavName);
                
                let relativeAudioPath = null;
                
                if (fs.existsSync(mp3Path)) {
                    relativeAudioPath = path.relative(this.contentDir, mp3Path);
                } else if (fs.existsSync(wavPath)) {
                    relativeAudioPath = path.relative(this.contentDir, wavPath);
                }

                // Check for associated evaluation file
                // Convention: topic_name.md -> topic_name_evaluacion.md
                const evalName = file.name.replace('.md', '_evaluacion.md');
                const evalPath = path.join(modulePath, evalName);
                let relativeEvalPath = null;

                if (fs.existsSync(evalPath)) {
                    relativeEvalPath = path.relative(this.contentDir, evalPath);
                }

                // Get title from file
                const title = await this.getTopicTitle(filePath, file.name);

                const topicData = {
                    id: topicId,
                    module_id: moduleId,
                    title: title,
                    file_path: path.relative(this.contentDir, filePath),
                    audio_path: relativeAudioPath,
                    evaluation_path: relativeEvalPath,
                    order_index: orderIndex++,
                    estimated_minutes: 0 // TODO: Calculate from content length
                };

                await dbService.upsertTopic(topicData);
            }

            // Also check subdirectories (Actividades, Material, Evaluaciones)
            const subdirs = ['Actividades', 'Material', 'Evaluaciones'];
            for (const subdir of subdirs) {
                const subdirPath = path.join(modulePath, subdir);
                if (fs.existsSync(subdirPath)) {
                    await this.parseSubdirectoryTopics(moduleId, subdirPath, orderIndex);
                }
            }
        } catch (error) {
            logger.error(`Error parsing topics for ${moduleId}:`, error);
        }
    }

    /**
     * Parse topics from subdirectories
     */
    async parseSubdirectoryTopics(moduleId, subdirPath, startIndex) {
        const files = fs.readdirSync(subdirPath, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'));

        let orderIndex = startIndex;

        for (const file of files) {
            const topicId = `${moduleId}/${path.basename(subdirPath)}/${file.name.replace('.md', '')}`;
            const filePath = path.join(subdirPath, file.name);
            const title = await this.getTopicTitle(filePath, file.name);

            const topicData = {
                id: topicId,
                module_id: moduleId,
                title: `${path.basename(subdirPath)}: ${title}`,
                file_path: path.relative(this.contentDir, filePath),
                audio_path: null,
                order_index: orderIndex++,
                estimated_minutes: 0
            };

            await dbService.upsertTopic(topicData);
        }
    }

    /**
     * Get topic title from markdown file
     */
    async getTopicTitle(filePath, fallbackName) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const titleMatch = content.match(/^#\s+(.+)$/m);
            
            if (titleMatch) {
                return titleMatch[1].trim();
            }
        } catch (error) {
            logger.warn(`Could not read title from ${filePath}`);
        }
        
        // Fallback to filename
        return fallbackName.replace('.md', '').replace(/_/g, ' ');
    }

    /**
     * Get all courses from database
     */
    async getAllCourses() {
        return await dbService.getAllCourses();
    }

    /**
     * Get course structure (modules and topics)
     */
    async getCourseStructure(courseId) {
        const course = await dbService.getCourseById(courseId);
        if (!course) {
            return null;
        }

        const modules = await dbService.getModulesByCourse(courseId);
        
        // Get topics for each module
        const modulesWithTopics = await Promise.all(modules.map(async module => ({
            ...module,
            topics: await dbService.getTopicsByModule(module.id)
        })));

        return {
            ...course,
            modules: modulesWithTopics
        };
    }

    /**
     * Get topic content
     */
    async getTopicContent(topicId) {
        const topic = await dbService.getTopicById(topicId);
        if (!topic) {
            return null;
        }

        const contentPath = path.join(this.contentDir, topic.file_path);
        
        if (!fs.existsSync(contentPath)) {
            logger.error(`Content file not found: ${contentPath}`);
            return null;
        }

        const content = fs.readFileSync(contentPath, 'utf-8');
        
        return {
            ...topic,
            content: content
        };
    }

    /**
     * Get audio file path
     */
    async getAudioPath(topicId) {
        const topic = await dbService.getTopicById(topicId);
        if (!topic || !topic.audio_path) {
            return null;
        }

        return path.join(this.contentDir, topic.audio_path);
    }

    /**
     * Get evaluation content path
     */
    async getEvaluationPath(topicId) {
        const topic = await dbService.getTopicById(topicId);
        if (!topic || !topic.evaluation_path) {
            return null;
        }

        return path.join(this.contentDir, topic.evaluation_path);
    }
    
    /**
     * Get evaluation content
     */
    async getEvaluationContent(topicId) {
        const topic = await dbService.getTopicById(topicId);
        if (!topic || !topic.evaluation_path) {
            return null;
        }

        const evalPath = path.join(this.contentDir, topic.evaluation_path);
        
        if (!fs.existsSync(evalPath)) {
            logger.warn(`Evaluation file not found: ${evalPath}`);
            return null;
        }

        return fs.readFileSync(evalPath, 'utf-8');
    }
}

module.exports = new CourseService();
