const dbService = require('./src/services/dbService');

async function check() {
    try {
        await dbService.init();
        const row = await dbService.get("SELECT COUNT(*) as count FROM topics WHERE evaluation_path IS NOT NULL");
        console.log(`✅ Temas con evaluación activa: ${row.count}`);
    } catch (e) { console.error(e); }
}
check();
