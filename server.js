const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

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
                sorting: 'price', // Исправлено
                direct: 'false',
                currency: 'rub',
                limit: 50,
                token: TOKEN
            }
        });

        res.json({ tickets: response.data.data || [] });
    } catch (error) {
        console.error("Ошибка API Aviasales:", error.response?.data || error.message);
        res.status(500).json({ error: "Не удалось получить данные от авиакомпаний" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SAPAR Server running on port ${PORT}`));