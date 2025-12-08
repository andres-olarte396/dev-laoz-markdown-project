const path = require('path');
const fs = require('fs');

const CONTENT_DIR = path.resolve(__dirname, '../../public/content');

// Helper para búsqueda recursiva
function findInDir(dir, filter, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
            findInDir(filePath, filter, fileList);
        } else if (filter.test(filePath)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// Buscar en contenido
function searchFiles(req, res) {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const matchingFiles = [];
        const files = findInDir(CONTENT_DIR, /\.(md|txt)$/); // Solo buscar en md y txt

        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            if (content.toLowerCase().includes(query.toLowerCase())) {
                // Crear ruta relativa para el frontend
                const relativePath = path.relative(CONTENT_DIR, file).replace(/\\/g, '/');
                matchingFiles.push({
                    path: relativePath,
                    name: path.basename(file),
                    match: content.substring(content.toLowerCase().indexOf(query.toLowerCase()), 100) + "..." // Snippet simple
                });
            }
        });

        res.json({ results: matchingFiles });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: 'Error durante la búsqueda' });
    }
}

// Obtener contenido de un archivo
// Obtener contenido de un archivo
function getFile(req, res) {
    // req.params[0] contains the wildcard match (e.g. "project/doc.md")
    const filePath = path.join(CONTENT_DIR, req.params[0]);
    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        res.sendFile(filePath);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error al obtener el archivo' });
        }
    }
}

// Crear un nuevo archivo
function createFile(req, res) {
    const { fileName, content } = req.body;
    const filePath = path.join(__dirname, '../markdown-files', fileName);
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        res.status(201).json({ message: 'Archivo creado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el archivo' });
    }
}

// Actualizar un archivo existente
function updateFile(req, res) {
    const filePath = path.join(__dirname, '../markdown-files', req.params.fileName);
    const { content } = req.body;
    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        fs.writeFileSync(filePath, content, 'utf8');
        res.json({ message: 'Archivo actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el archivo' });
    }
}

module.exports = { getFile, createFile, updateFile, searchFiles };
