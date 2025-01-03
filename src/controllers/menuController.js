const path = require('path');
const fs = require('fs');

// Obtener menú de directorios y archivos
function getMenu(req, res) {
    const directoryPath = path.join(__dirname, '../../public/content'); // Cambia esto a tu ruta
    try {
        const files = fs.readdirSync(directoryPath).map(file => ({
            name: file,
            isDirectory: fs.statSync(path.join(directoryPath, file)).isDirectory()
        }));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el menú' });
    }
}

module.exports = { getMenu };
