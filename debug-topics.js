const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'db', 'l4oz_learning.db');
const db = new sqlite3.Database(dbPath);
const contentDir = path.join(__dirname, 'public', 'content');

console.log('--- DIAGNOSTIC START ---');
console.log(`DB Path: ${dbPath}`);
console.log(`Content Dir: ${contentDir}`);

db.all("SELECT id, title, file_path FROM topics LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error("DB Error:", err);
        return;
    }

    if (rows.length === 0) {
        console.log("⚠️  NO TOPICS FOUND IN DATABASE!");
    } else {
        console.log(`✅ Found ${rows.length} topics. Checking file paths...`);
        rows.forEach(row => {
            const fullPath = path.join(contentDir, row.file_path);
            const exists = fs.existsSync(fullPath);
            console.log(`\nTopic ID: ${row.id}`);
            console.log(`  File Path (DB): ${row.file_path}`);
            console.log(`  Full Path: ${fullPath}`);
            console.log(`  Exists? ${exists ? '✅ YES' : '❌ NO'}`);
        });
    }
    console.log('--- DIAGNOSTIC END ---');
    db.close();
});
