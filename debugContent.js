const dbService = require('./src/services/dbService');
const courseService = require('./src/services/courseService');

async function debug() {
    try {
        await dbService.init();
        
        console.log('=== DEBUGGING COURSES ===');
        const courses = await dbService.getAllCourses();
        courses.forEach(c => console.log(`${c.id}: ${c.title}`));

        const targetCourseId = 'teach-laoz-curso_proyecto_vida';
        console.log(`\n=== DEBUGGING MODULES FOR ${targetCourseId} ===`);
        const modules = await dbService.getModulesByCourse(targetCourseId);
        
        for (const m of modules) {
            console.log(`Module: ${m.id} (Order: ${m.order_index})`);
            const topics = await dbService.getTopicsByModule(m.id);
            console.log(`  Topics count: ${topics.length}`);
            topics.forEach(t => console.log(`    - [${t.id}] ${t.title} (File: ${t.file_path})`));
        }

        console.log('\n=== DEBUGGING COMMUNICATION COURSE (Comparison) ===');
        const commModules = await dbService.getModulesByCourse('teach-laoz-communication');
         for (const m of commModules) {
            if (m.id.includes('modulo_1')) {
                console.log(`Module: ${m.id}`);
                const topics = await dbService.getTopicsByModule(m.id);
                console.log(`  Topics count: ${topics.length}`);
                topics.forEach(t => console.log(`    - [${t.id}] ${t.title}`));
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        dbService.close();
    }
}

debug();
