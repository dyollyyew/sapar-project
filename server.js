const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Твой токен из Travelpayouts
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || "23a9b11bc2672f0692432adc75cfc003";

app.post('/api/search-live', async (req, res) => {
    const { origin, destination, date } = req.body;
    try {
        const response = await axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
            params: {
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                departure_at: date,
                unique: 'false',
                sorting: 'price',
                direct: 'false',
                currency: 'rub',
                limit: 30,
                token: TOKEN
            }
        });
        res.json({ tickets: response.data.data || [] });
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: "API baglanyşyk ýalňyşlygy" }); //
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));