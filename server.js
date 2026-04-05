const express = require('express');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// ВАЖНО: Эта строка заставляет сервер показывать твой index.html
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.MARKER;

app.post('/api/search-live', async (req, res) => {
    try {
        const { origin, destination, date } = req.body;
        // Тут логика генерации подписи и запроса к Aviasales (как я давал выше)
        // ... (код запроса) ...
        res.json(results.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Отправляем index.html на любой другой запрос
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Active on port ${PORT}`));