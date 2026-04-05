const express = require('express');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// Раздаем статические файлы (твой index.html) из текущей папки
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.MARKER;

// Функция для создания подписи (Signature) для Aviasales API
function generateSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const orderedParams = sortedKeys.map(key => {
        return typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
    }).join(':');
    const dataString = `${TOKEN}:${MARKER}:${orderedParams}`;
    return crypto.createHash('md5').update(dataString).digest('hex');
}

app.post('/api/search-live', async (req, res) => {
    try {
        const { origin, destination, date } = req.body;
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        const searchParams = {
            marker: MARKER,
            host: "sapar-project-production.up.railway.app",
            user_ip: userIP.replace('::ffff:', ''),
            locale: "ru",
            trip_class: "Y",
            passengers: { adults: 1, children: 0, infants: 0 },
            directions: [{ origin, destination, date }]
        };

        const signature = generateSignature(searchParams);

        // 1. Инициация поиска (Start)
        const startResponse = await axios.post('https://tickets-api.travelpayouts.com/search/affiliate/start', 
            { ...searchParams, signature },
            { headers: { 'x-affiliate-user-id': TOKEN } }
        );

        const { search_id, results_url } = startResponse.data;

        // 2. Ждем 7-10 секунд, пока API соберет билеты
        await new Promise(resolve => setTimeout(resolve, 8000));

        // 3. Получение результатов
        const finalResults = await axios.post(`${results_url}/search/affiliate/results`, {
            search_id,
            last_update_timestamp: 0
        });

        res.json(finalResults.data);
    } catch (e) {
        console.error("API ERROR LOG:", e.response?.data || e.message);
        res.status(500).json({ error: "Ошибка при поиске билетов: " + (e.response?.data?.error || e.message) });
    }
});

// Все остальные запросы направляем на index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));