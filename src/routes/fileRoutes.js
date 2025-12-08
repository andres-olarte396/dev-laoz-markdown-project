const express = require('express');
const { getFile, createFile, updateFile, searchFiles } = require('../controllers/fileController');

const router = express.Router();

// Ruta de búsqueda (Debe ir ANTES del wildcard)
router.get('/search', searchFiles);

// Ruta para obtener un archivo
router.get('/*', getFile);

// Ruta para crear un archivo
router.post('/', createFile);

// Ruta para actualizar un archivo
router.put('/:fileName', updateFile);

module.exports = router;
