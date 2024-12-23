const express = require('express');
const { getMenu } = require('../controllers/menuController');

const router = express.Router();

// Ruta para obtener el menú
router.get('/', getMenu);

module.exports = router;
