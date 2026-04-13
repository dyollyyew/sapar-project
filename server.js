const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Раздаем статику из папки frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// 1. Автокомплит городов (через сервер, чтобы не было CORS Error)
app.get('/api/autocomplete', async (req, res) => {
    try {
        const { term } = req.query;
        const response = await axios.get(`https://autocomplete.travelpayouts.com/jcity`, {
            params: { locale: 'ru', types: ['city'], term: term }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Ошибка подсказок" });
    }
});

// 2. Поиск билетов
app.post('/api/search-live', async (req, res) => {
    const { origin, destination, date } = req.body;
    const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || "23a9b11bc2672f0692432adc75cfc003";

    try {
        const response = await axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
            params: {
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                departure_at: date,
                unique: 'false',
                sorting: 'price',
                currency: 'rub',
                token: TOKEN
            }
        });
        res.json({ success: true, tickets: response.data.data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: "Ошибка API" });
    }
});

// SPA поддержка
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));