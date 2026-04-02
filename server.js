const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./sapar.db', (err) => {
    if (err) console.error('ОШИБКА БД:', err.message);
    else console.log('База данных SAPAR подключена успешно.');
});

// ЭТОТ БЛОК НУЖЕН ДЛЯ ПОИСКА:
app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    console.log(`Запрос поиска: из ${from} в ${to}`);

    const sql = `SELECT * FROM trips WHERE departure = ? AND arrival = ?`;
    
    db.all(sql, [from, to], (err, rows) => {
        if (err) {
            console.error('Ошибка запроса:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); 
    });
});

app.get('/', (req, res) => {
    res.send('SAPAR Backend работает чисто! Жду запросов... ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});