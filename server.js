const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.post('/api/search-live', async (req, res) => {
const { origin, destination, date } = req.body;
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;

 try {
 // Мы используем эндпоинт prices_for_dates с параметрами для получения МАКСИМАЛЬНОГО количества рейсов
const response = await axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
 params: {
origin: origin.toUpperCase(),
destination: destination.toUpperCase(),
departure_at: date,
 unique: 'false', // Важно: показывать все рейсы, а не только один уникальный sorting: 'price',
direct: 'false', // Показывает и прямые, и с пересадками
 currency: 'rub',
 limit: 50, // Увеличили лимит до 50 рейсов
 token: TOKEN
}
 });

 // Отправляем массив всех найденных билетов
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