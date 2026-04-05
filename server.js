const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.MARKER;

// Функция генерации подписи по правилам Aviasales (MD5)
function generateSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const orderedParams = sortedKeys.map(key => {
        return typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
    }).join(':');
    
    const dataString = `${TOKEN}:${MARKER}:${orderedParams}`;
    return crypto.createHash('md5').update(dataString).digest('hex');
}

app.post('/api/search-live', async (req, res) => {
    const { origin, destination, date } = req.body;
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const searchParams = {
        marker: MARKER,
        host: "sapar-project-production.up.railway.app", // Твой домен на Railway
        user_ip: userIP.replace('::ffff:', ''),
        locale: "ru",
        trip_class: "Y",
        passengers: { adults: 1, children: 0, infants: 0 },
        directions: [{ origin, destination, date }]
    };

    try {
        // 1. Старт поиска
        const signature = generateSignature(searchParams);
        const start = await axios.post('https://tickets-api.travelpayouts.com/search/affiliate/start', 
            { ...searchParams, signature },
            { 
                headers: { 
                    'x-affiliate-user-id': TOKEN, 
                    'x-real-host': searchParams.host, 
                    'x-user-ip': searchParams.user_ip
                } 
            }
        );

        const { search_id, results_url } = start.data;

        // 2. Ожидание сбора данных (стандарт API 30-60 сек, делаем первую проверку через 6)
        await new Promise(r => setTimeout(r, 6000));

        // 3. Получение результатов
        const results = await axios.post(`${results_url}/search/affiliate/results`, {
            search_id,
            last_update_timestamp: 0
        });

        res.json(results.data);
    } catch (error) {
        console.error("API ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка поиска. Проверьте доступ к Search API в Travelpayouts." });
    }
});

app.listen(PORT, () => console.log(`Бизнес-сервер SAPAR.TM запущен на порту ${PORT}`));