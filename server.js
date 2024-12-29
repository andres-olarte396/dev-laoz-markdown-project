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
    dir: path.join(__dirname, './public')
  }
});

const PORT = args.port;
const DIRECTORY = path.resolve(path.join(__dirname, args.dir || './public'));

// Verificar si el directorio existe; si no, crearlo
if (!fs.existsSync(DIRECTORY)) {
  fs.mkdirSync(DIRECTORY, { recursive: true });
}

const app = express();
// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/menu', menuRoutes); // Ruta base para el menú
app.use('/api/files', fileRoutes); // Ruta base para archivos markdown

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal.');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Sirviendo archivos desde ${DIRECTORY}`);
});
