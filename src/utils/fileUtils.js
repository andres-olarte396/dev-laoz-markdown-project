const fs = require('fs');
const path = require('path');

// 1. Leer un archivo
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Error al leer el archivo: ${error.message}`);
    }
}

// 2. Crear un archivo
function createFile(filePath, content) {
    try {
        // Crear la carpeta si no existe
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Crear el archivo si no existe
        fs.writeFileSync(filePath, content, { flag: 'wx' }); // `wx` para evitar sobrescribir archivos existentes
        return { message: 'Archivo creado con éxito', filePath };
    } catch (error) {
        if (error.code === 'EEXIST') {
            throw new Error('El archivo ya existe');
        }
        throw new Error(`Error al crear el archivo: ${error.message}`);
    }
}

// 3. Editar un archivo
function editFile(filePath, content) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error('El archivo no existe');
        }
        fs.writeFileSync(filePath, content);
        return { message: 'Archivo editado con éxito', filePath };
    } catch (error) {
        throw new Error(`Error al editar el archivo: ${error.message}`);
    }
}

// 4. Listar todos los archivos .md en un directorio y subdirectorios
function listFiles(rootPath, directoryPath = rootPath) {
    try {
        let filesList = [];

        // Leer el contenido del directorio
        const files = fs.readdirSync(directoryPath);

        files.forEach(file => {
            const fullPath = path.join(directoryPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Si es un directorio, llamar recursivamente
               filesList = listFiles(rootPath, fullPath);
            } else if (path.extname(file) === '.md') {
                // Si es un archivo Markdown, agregarlo a la lista
                filesList.push(fullPath.replace(rootPath, ''));    
            }
        });

        return filesList;
    } catch (error) {
        throw new Error(`Error al listar los archivos: ${error.message}`);
    }
}

// 5. Eliminar un archivo
function deleteFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error('El archivo no existe');
        }
        fs.unlinkSync(filePath);
        return { message: 'Archivo eliminado con éxito', filePath };
    } catch (error) {
        throw new Error(`Error al eliminar el archivo: ${error.message}`);
    }
}

module.exports = { readFile, createFile, editFile, listFiles, deleteFile };
