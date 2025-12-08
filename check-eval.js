const dbService = require('./src/services/dbService');
const logger = require('./src/utils/logger');

async function checkEvaluations() {
    try {
        await dbService.init();
        const topics = await dbService.all('SELECT * FROM topics WHERE evaluation_path IS NOT NULL');
        
        console.log('\n--- EVALUATION CHECK ---');
        if (topics.length > 0) {
            console.log(`✅ Se encontraron ${topics.length} temas con evaluación:`);
            topics.forEach(t => {
                console.log(`- ${t.title}`);
                console.log(`  Eval: ${t.evaluation_path}`);
            });
        } else {
            console.log('⚠️ No se encontraron temas con evaluación registrada.');
        }
    } catch (error) {
        console.error(error);
    }
}

checkEvaluations();
