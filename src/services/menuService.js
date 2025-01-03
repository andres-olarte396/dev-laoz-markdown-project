const fs = require('fs');
const path = require('path');

// Genera el menú basado en el directorio
function generateMenu(directoryPath) {
    console.log("directoryPath: ", directoryPath);
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

    // Filtrar y procesar los elementos del directorio
    return entries
        .filter(entry => entry.name.endsWith('.md') || entry.isDirectory()) // Filtrar archivos .md y directorios
        .map(entry => {
            const fullPath = path.join(directoryPath, entry.name);
            let rootDir = fullPath.indexOf("\\public");
            const relativePath = fullPath.slice(rootDir); // Convertir a formato web-friendly
            
            if (entry.isDirectory()) {
                // Si es un directorio, generar recursivamente el menú de sus hijos
                return {
                    name: entry.name,
                    path: relativePath + fs.existsSync('foo.txt') ? '.md' : '',
                    isDirectory: true,
                    children: generateMenu(fullPath) // Llamada recursiva
                };
            } else {
                // Si es un archivo, simplemente devolver su información
                return {
                    name: entry.name.replace('.md', ''), // Remover la extensión del nombre
                    path: relativePath,
                    isDirectory: false,
                    children: [] // Los archivos no tienen hijos
                };
            }
        });
}

module.exports = { generateMenu };