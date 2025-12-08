// Test manual module insert
const dbService = require('./src/services/dbService');

async function testInsert() {
    try {
        console.log('Initializing database...');
        await dbService.initialize();
        
        console.log('Inserting test module...');
        const result = await dbService.upsertModule({
            id: 'test-course/modulo1',
            course_id: 'test-course',
            module_number: 1,
            title: 'Test Module',
            description: 'Test Description',
            order_index: 0
        });
        
        console.log('Insert result:', result);
        
        console.log('Retrieving modules...');
        const modules = await dbService.getModulesByCourse('test-course');
        console.log('Found modules:', modules.length);
        console.log('Modules:', modules);
        
        dbService.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testInsert();
