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

    try {
        const signature = generateSignature(searchParams);
        const start = await axios.post('https://tickets-api.travelpayouts.com/search/affiliate/start', 
            { ...searchParams, signature },
            { headers: { 'x-affiliate-user-id': TOKEN, 'x-real-host': searchParams.host, 'x-user-ip': searchParams.user_ip } }
        );

        const { search_id, results_url } = start.data;
        await new Promise(r => setTimeout(r, 7000)); // Ждем 7 секунд для сбора билетов

        const results = await axios.post(`${results_url}/search/affiliate/results`, {
            search_id,
            last_update_timestamp: 0
        });

        res.json(results.data);
    } catch (error) {
        console.error("API ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка на стороне API Aviasales" });
    }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));