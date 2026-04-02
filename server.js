const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Подключение к базе
const db = new sqlite3.Database('./sapar.db');

// ГЛАВНЫЙ МАРШРУТ: Поиск билетов
app.get('/api/search', (req, res) => {
    const { from, to } = req.query; // Получаем города из запроса фронтенда
    
    // Запрос к таблице (убедись, что столбцы называются так же: departure, arrival)
    const sql = `SELECT * FROM trips WHERE departure = ? AND arrival = ?`;
    
    db.all(sql, [from, to], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Отправляем найденные билеты обратно на фронтенд
        res.json(rows); 
    });
});

app.get('/', (req, res) => {
    res.send('SAPAR Backend работает! Жду запросов от фронтенда. ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    const cors = require('cors');
app.use(cors({
    origin: '*', // Разрешает запросы с любого адреса (включая твой локальный файл)
    methods: ['GET', 'POST']
}));
});