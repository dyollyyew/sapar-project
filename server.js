const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// ВАЖНО: Указываем серверу, что статические файлы (html, css) лежат в папке frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Маршрут для поиска билетов
app.post('/api/search-live', async (req, res) => {
    try {
        const { origin, destination, date } = req.body;
        const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;

        if (!TOKEN) {
            return res.status(500).json({ error: "TRAVELPAYOUTS_TOKEN не найден в переменных Railway" });
        }

        // Прямой запрос к API Aviasales v3
        const response = await axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
            params: {
                origin: origin,
                destination: destination,
                departure_at: date,
                unique: 'false',
                sorting: 'price',
                direct: 'false',
                currency: 'rub',
                limit: 15,
                token: TOKEN
            }
        });

        res.json({ tickets: response.data.data || [] });
    } catch (e) {
        console.error("Ошибка API:", e.response?.data || e.message);
        res.status(500).json({ error: "Ошибка на стороне авиа-сервера" });
    }
});

// Все остальные запросы отдают index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер SAPAR запущен на порту ${PORT}`));