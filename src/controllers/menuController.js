const path = require('path');
const fs = require('fs');

const CONTENT_DIR = path.resolve(__dirname, '../../public/content');

// Helper recursivo
function buildMenuTree(dirPath) {
    const stats = fs.readdirSync(dirPath).map(fileName => {
        const fullPath = path.join(dirPath, fileName);
        const isDirectory = fs.statSync(fullPath).isDirectory();

        const item = {
            name: fileName,
            path: path.relative(CONTENT_DIR, fullPath).replace(/\\/g, '/'), // Normalizar paths web
            isDirectory
        };

        if (isDirectory) {
            item.children = buildMenuTree(fullPath);
        }

        return item;
    });
    return stats;
}

// Obtener menú de directorios y archivos
function getMenu(req, res) {
    try {
        if (!fs.existsSync(CONTENT_DIR)) {
            return res.json([]);
        }
        const tree = buildMenuTree(CONTENT_DIR);
        res.json(tree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el menú' });
    }
}

module.exports = { getMenu };
