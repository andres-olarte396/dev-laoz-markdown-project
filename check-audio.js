const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'l4oz_learning.db');
const db = new sqlite3.Database(dbPath);

console.log('--- AUDIO CHECK ---');
db.all("SELECT id, title, audio_path FROM topics WHERE audio_path IS NOT NULL AND audio_path != '' LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error("Error:", err);
        return;
    }
    
    if (rows.length === 0) {
        console.log("⚠️ No se encontraron temas con audio registrado.");
    } else {
        console.log("✅ Ejemplos de temas con audio:");
        rows.forEach(r => console.log(`- ${r.title}\n  Audio: ${r.audio_path}`));
    }
    db.close();
});
