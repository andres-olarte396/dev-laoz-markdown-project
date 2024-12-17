const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const { readFile, createFile, editFile, listFiles, deleteFile } = require('./src/utils/fileUtils'); // Asegúrate de que el nombre del archivo sea correcto
const { generateMenu } = require('./src/services/menuService');

// Parseamos los argumentos de la línea de comandos
const args = minimist(process.argv.slice(2), {
  default: {
    port: 3000,
    dir: path.join(__dirname, 'public/content')
  }
});

const PORT = args.port;
const DIRECTORY = path.resolve(path.join(__dirname, args.dir));

// Verificar si el directorio existe; si no, crearlo
if (!fs.existsSync(DIRECTORY)) {
  fs.mkdirSync(DIRECTORY, { recursive: true });
}

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'src/views')));
app.use('/content', express.static(path.join(__dirname, 'public/content')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.get('/api/menu', (req, res) => {
  const menu = generateMenu(path.join(__dirname, 'public/content'));
  res.json(menu);
});

// Crear un archivo Markdown
app.post('/markdown', (req, res) => {
  const { filename, content } = req.body;
  try {
    const filePath = path.join(DIRECTORY, `/content/${filename}.md`);
    const result = createFile(filePath, content);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Leer un archivo Markdown
app.get('/markdown/:filename', (req, res) => {
  const { filename } = req.params;
  try {
    const filePath = path.join(DIRECTORY, `/content/${filename}.md`);
    const content = readFile(filePath);
    res.status(200).json({ content });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Editar un archivo Markdown
app.put('/markdown/:filename', (req, res) => {
  const { filename } = req.params;
  const { content } = req.body;
  try {
    const filePath = path.join(DIRECTORY, `/content/${filename}.md`);
    const result = editFile(filePath, content);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos los archivos Markdown
app.get('/markdown', (req, res) => {
  try {
    const files = listFiles(path.join(DIRECTORY, "/content/"));
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un archivo Markdown
app.delete('/markdown/:filename', (req, res) => {
  const { filename } = req.params;
  try {
    const filePath = path.join(DIRECTORY, `/content/${filename}.md`);
    const result = deleteFile(filePath);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Sirviendo archivos desde ${DIRECTORY}`);
});
