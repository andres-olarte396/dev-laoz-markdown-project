const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/l4oz_learning.db');

const targetId = "teach-laoz-curso_arquitectura/modulo_1/tema_1.1__qu_es_realmente_la_arquitectura__contenido";
const audioPath = "teach-laoz-curso_arquitectura\\modulos\\modulo_1\\test_audio.mp3";

console.log(`Updating topic: ${targetId}`);
console.log(`Setting audio_path to: ${audioPath}`);

db.run("UPDATE topics SET audio_path = ? WHERE id = ?", [audioPath, targetId], function(err) {
    if (err) {
        console.error("Error updating DB:", err);
    } else {
        console.log(`Changes: ${this.changes}`);
        if (this.changes > 0) {
            console.log("✅ Audio path updated successfully!");
        } else {
            console.log("⚠️ No rows updated. Check ID.");
        }
    }
    db.close();
});
