// DB check with JSON output
const dbService = require('../../src/services/dbService');
const fs = require('fs');
const path = require('path');

async function checkAndSave() {
    try {
        await dbService.initialize();
        
        const courses = await dbService.getAllCourses();
        const result = {
            totalCourses: courses.length,
            courses: []
        };
        
        for (const course of courses) {
            const modules = await dbService.getModulesByCourse(course.id);
            const courseData = {
                id: course.id,
                title: course.title,
                totalModulesMetadata: course.total_modules,
                modulesInDB: modules.length,
                modules: []
            };
            
            for (const module of modules) {
                const topics = await dbService.getTopicsByModule(module.id);
                courseData.modules.push({
                    id: module.id,
                    title: module.title,
                    topicsCount: topics.length
                });
            }
            
            result.courses.push(courseData);
        }
        
        const outputPath = path.join(__dirname, '../../db-status.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log('Database status saved to db-status.json');
        console.log(`Total courses: ${result.totalCourses}`);
        console.log(`Courses with modules: ${result.courses.filter(c => c.modulesInDB > 0).length}`);
        
        dbService.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAndSave();
