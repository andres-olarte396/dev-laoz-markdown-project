const express = require('express');
const path = require('path');
const { generateMenu } = require('./src/services/menuService');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src/views')));
app.use('/content', express.static(path.join(__dirname, 'public/content')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.get('/api/menu', (req, res) => {
    const menu = generateMenu(path.join(__dirname, 'public/content'));
    res.json(menu);
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});