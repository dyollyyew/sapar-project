const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Чтобы index.html открывался сам

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.MARKER;

function generateSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const orderedParams = sortedKeys.map(key => {
        return typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
    }).join(':');
    return crypto.createHash('md5').update(`${TOKEN}:${MARKER}:${orderedParams}`).digest('hex');
}

app.post('/api/search-live', async (req, res) => {
    const { origin, destination, date } = req.body;
    const searchParams = {
        marker: MARKER,
        host: "sapar-project-production.up.railway.app",
        user_ip: "127.0.0.1",
        locale: "ru",
        trip_class: "Y",
        passengers: { adults: 1, children: 0, infants: 0 },
        directions: [{ origin, destination, date }]
    };

    try {
        const signature = generateSignature(searchParams);
        const start = await axios.post('https://tickets-api.travelpayouts.com/search/affiliate/start', 
            { ...searchParams, signature },
            { headers: { 'x-affiliate-user-id': TOKEN } }
        );

        const { results_url, search_id } = start.data;
        await new Promise(r => setTimeout(r, 10000)); // Ждем 10 сек для API

        const results = await axios.post(`${results_url}/search/affiliate/results`, {
            search_id,
            last_update_timestamp: 0
        });

        res.json(results.data);
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка API" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));