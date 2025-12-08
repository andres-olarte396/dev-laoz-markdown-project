const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/l4oz_learning.db');

db.run("ALTER TABLE topics ADD COLUMN evaluation_path TEXT", (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log("Column already exists.");
        } else {
            console.error("Migration failed:", err.message);
        }
    } else {
        console.log("Migration successful: Added evaluation_path column.");
    }
    db.close();
});
