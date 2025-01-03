const express = require('express');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');

// Carga las variables de entorno
require('dotenv').config();

const menuRoutes = require('./src/routes/menuRoutes');
const fileRoutes = require('./src/routes/fileRoutes');

// Parseamos los argumentos de la línea de comandos
const args = minimist(process.argv.slice(2), {
  default: {
    port: 7000,
    dir: path.join(__dirname, './public/md')
  }
});

const PORT = args.port;
const HTML_DIRECTORY = path.resolve(path.join(__dirname, './src'));
const MD_DIRECTORY = path.resolve(path.join(__dirname, args.dir || './public'));

// Verificar si los directorios existen; si no, crearlos
[HTML_DIRECTORY, MD_DIRECTORY].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos HTML desde el directorio `src`
app.use('/app', express.static(HTML_DIRECTORY));

// Rutas API
app.use('/api/menu', menuRoutes); // Ruta base para el menú
app.use('/api/files', fileRoutes); // Ruta base para archivos markdown

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal.');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Archivos HTML disponibles en http://localhost:${PORT}/app`);
  console.log(`Archivos Markdown disponibles en http://localhost:${PORT}/api`);
});
