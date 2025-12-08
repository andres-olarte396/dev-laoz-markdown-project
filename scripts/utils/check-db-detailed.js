// Detailed DB check with error logging
const dbService = require('./src/services/dbService');
const logger = require('./src/utils/logger');

async function detailedCheck() {
    try {
        console.log('\n🔍 Starting detailed database check...\n');
        
        await dbService.initialize();
        console.log('✓ Database initialized\n');
        
        // Check courses
        const courses = await dbService.getAllCourses();
        console.log(`📚 Total Courses: ${courses.length}\n`);
        
        for (const course of courses) {
            console.log(`\n📖 Course: ${course.title}`);
            console.log(`   ID: ${course.id}`);
            console.log(`   Total Modules (metadata): ${course.total_modules}`);
            
            // Check modules
            const modules = await dbService.getModulesByCourse(course.id);
            console.log(`   Modules (actual): ${modules.length}`);
            
            if (modules.length === 0) {
                console.log('   ⚠️  NO MODULES FOUND IN DATABASE!');
            } else {
                for (const module of modules) {
                    const topics = await dbService.getTopicsByModule(module.id);
                    console.log(`     - ${module.title} (${module.id}): ${topics.length} topics`);
                }
            }
        }
        
        console.log('\n✓ Check complete\n');
        dbService.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

detailedCheck();
