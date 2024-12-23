const express = require('express');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const menuRoutes = require('./src/routes/menuRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const bodyParser = require('body-parser');
const process = require('dotenv').config();

router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Acceso autorizado', user: req.user });
});

// Parseamos los argumentos de la línea de comandos
const args = minimist(process.argv.slice(2), {
  default: {
    port: 3000,
    dir: path.join(__dirname, './public')
  }
});

const PORT = args.port;
const DIRECTORY = path.resolve(path.join(__dirname, args.dir));

// Verificar si el directorio existe; si no, crearlo
if (!fs.existsSync(DIRECTORY)) {
  fs.mkdirSync(DIRECTORY, { recursive: true });
}

const app = express();
// Middleware para parsear JSON
app.use(express.json());

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

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
