const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/l4oz_learning.db');

const sql = `
CREATE TABLE IF NOT EXISTS evaluation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage REAL NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT 0,
    answers JSON,
    time_spent_seconds INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);
`;

db.run(sql, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Table evaluation_results ready.");
    }
    db.close();
});
