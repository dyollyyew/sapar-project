const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors'); // Добавлено для работы запросов
require('dotenv').config();

const app = express();

// Настройки
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// API Маршрут
app.post('/api/search-live', async (req, res) => {
    const { origin, destination, date } = req.body;
    
    // Используем токен из .env или системный
    const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || "23a9b11bc2672f0692432adc75cfc003";

    // Проверка входных данных
    if (!origin || !destination || !date) {
        return res.status(400).json({ error: "Отсутствуют обязательные параметры (origin, destination, date)" });
    }

    try {
        console.log(`🔎 Поиск: ${origin} -> ${destination} на ${date}`);

        const response = await axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
            params: {
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                departure_at: date, // Ожидается формат YYYY-MM или YYYY-MM-DD
                unique: 'false',
                sorting: 'price',
                direct: 'false',
                currency: 'rub', // Можно сменить на 'usd' для стабильности
                limit: 30,
                token: TOKEN
            },
            timeout: 10000 // Ждем ответ не более 10 секунд
        });

        // Отправляем данные фронтенду
        res.json({ 
            success: true,
            tickets: response.data.data || [] 
        });

    } catch (error) {
        console.error("❌ Ошибка API Aviasales:", error.response?.data || error.message);
        
        // Отправляем понятную ошибку клиенту
        res.status(500).json({ 
            success: false,
            error: "Не удалось получить данные от авиакомпаний",
            details: error.response?.data?.message || error.message
        });
    }
});

// Для всех остальных запросов отдаем index.html (SPA поддержка)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
flatpickr("#date", { 
    minDate: "today", 
    dateFormat: "Y-m-d" // Обязательно для API
});

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`----------------------------------`);
    console.log(`🚀 SAPAR Server running on port ${PORT}`);
    console.log(`📂 Static files: ${path.join(__dirname, 'frontend')}`);
    console.log(`----------------------------------`);
});