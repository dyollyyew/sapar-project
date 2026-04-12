const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const TOKEN = "23a9b11bc2672f0692432adc75cfc003";

app.get('/api/search', async (req, res) => {
    try {
        const { origin, destination, date } = req.query;
        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.listen(3000, () => console.log('Сервер запущен на порту 3000'));