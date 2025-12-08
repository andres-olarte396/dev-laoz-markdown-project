// Quick DB check script
const dbService = require('./src/services/dbService');

async function checkDatabase() {
    try {
        await dbService.initialize();
        
        const courses = await dbService.getAllCourses();
        console.log(`\n📚 Total Courses: ${courses.length}`);
        
        for (const course of courses) {
            console.log(`\n  Course: ${course.title}`);
            const modules = await dbService.getModulesByCourse(course.id);
            console.log(`  Modules: ${modules.length}`);
            
            for (const module of modules) {
                const topics = await dbService.getTopicsByModule(module.id);
                console.log(`    - ${module.title}: ${topics.length} topics`);
            }
        }
        
        dbService.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDatabase();
