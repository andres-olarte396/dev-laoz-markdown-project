const dbService = require('./src/services/dbService');

async function check() {
    try {
        await dbService.init();
        const rows = await dbService.all("SELECT * FROM topics WHERE file_path LIKE '%evaluacion%' OR title LIKE '%Evaluacion%'");
        console.log(`Encontrados ${rows.length} temas de evaluación:`);
        rows.forEach(r => console.log(`- ${r.title} (${r.file_path})`));
    } catch (e) {
        console.error(e);
    }
}
check();
