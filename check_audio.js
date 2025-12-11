const dbService = require('./src/services/dbService');

async function checkAudio() {
    try {
        await dbService.init();
        
        console.log('Checking audio paths for teach-laoz-communication module 1...');
        const topics = await dbService.getTopicsByModule('teach-laoz-communication/modulo_1');
        
        topics.forEach(t => {
            console.log(`Topic: ${t.id}`);
            console.log(`  Audio Path: ${t.audio_path}`);
            console.log(`  Exists? ${t.audio_path ? 'YES' : 'NO'}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        dbService.close();
    }
}

checkAudio();
