const express = require('express');
const { getFile, createFile, updateFile } = require('../controllers/fileController');

const router = express.Router();

// Ruta para obtener un archivo
router.get('/:fileName', getFile);

// Ruta para crear un archivo
router.post('/', createFile);

// Ruta para actualizar un archivo
router.put('/:fileName', updateFile);

module.exports = router;
