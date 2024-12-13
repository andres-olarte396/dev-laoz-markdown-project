const fs = require('fs');

// Leer un archivo
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

module.exports = { readFile };