const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Разрешаем фронтенду подключаться
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./sapar.db', (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else console.log('База данных SAPAR подключена.');
});

// ВОТ ЭТОГО МАРШРУТА У ТЕБЯ НЕ ХВАТАЛО (404 ошибка из-за этого):
app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    console.log(`Ищем билеты из ${from} в ${to}`);

    // Запрос к базе (проверь, что в таблице trips есть колонки departure и arrival)
    const sql = `SELECT * FROM trips WHERE departure = ? AND arrival = ?`;
    
    db.all(sql, [from, to], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); // Отправляем массив найденных билетов
    });
});

app.get('/', (req, res) => {
    res.send('SAPAR Backend работает чисто! ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});