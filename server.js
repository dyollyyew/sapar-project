const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Railway сам подставит нужный PORT через переменную окружения
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); // Здесь лежат твои HTML, CSS и JS

// Маршрут для поиска билетов
app.get('/api/search', async (req, res) => {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
        return res.status(400).json({ error: "Укажите города и дату" });
    }

    try {
        const response = await axios.get('https://api.travelpayouts.com/v2/prices/latest', {
            params: {
                origin: origin.toUpperCase(),      // Например, ASB
                destination: destination.toUpperCase(), // Например, KZN
                beginning_of_period: date,
                one_way: true,
                currency: 'rub',
                limit: 15,
                token: process.env.TRAVELPAYOUTS_TOKEN, // Берется из Railway
                marker: process.env.MARKER               // Берется из Railway
            }
        });

        if (response.data.success) {
            res.json(response.data.data);
        } else {
            res.status(400).json({ error: "Ошибка API Travelpayouts" });
        }
    } catch (error) {
        console.error("Ошибка сервера:", error.message);
        res.status(500).json({ error: "Не удалось получить данные о рейсах" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер SAPAR.TM запущен на порту ${PORT}`);
});