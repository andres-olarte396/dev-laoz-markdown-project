const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/l4oz_learning.db');

db.get("SELECT * FROM topics WHERE title LIKE '%1.1%' AND file_path LIKE '%arquitectura%' LIMIT 1", (err, row) => {
    if(err) console.error(err);
    else console.log(JSON.stringify(row, null, 2));
    db.close();
});
