const express = require('express');
const cors = require('cors');
const app = express();

// 1. Настройка CORS (чтобы фронтенд мог делать запросы)
app.use(cors());
app.use(express.json());

// 2. Тестовый маршрут (проверка работы сервера)
app.get('/', (req, res) => {
    res.send('Бэкенд SAPAR успешно запущен и работает! 🚀');
});

// 3. Твой основной маршрут (пример для поиска или данных)
app.get('/api/test', (req, res) => {
    res.json({ message: "Данные успешно получены с сервера SAPAR" });
});

// 4. Настройка порта (ВАЖНО для Railway)
// Railway сам подставит нужное число в process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер SAPAR запущен на порту ${PORT}`);
});