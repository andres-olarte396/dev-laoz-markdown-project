const path = require('path');
const fs = require('fs');

// Obtener contenido de un archivo
function getFile(req, res) {
    const filePath = path.join(__dirname, '../markdown-files', req.params.fileName);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.send(content);
    } catch (error) {
        res.status(404).json({ error: 'Archivo no encontrado' });
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

module.exports = { getFile, createFile, updateFile };
