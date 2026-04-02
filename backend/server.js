const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Подключение к базе данных sapar.db
const db = new sqlite3.Database('./sapar.db', (err) => {
    if (err) console.error('Ошибка открытия БД:', err.message);
    else console.log('База данных SAPAR подключена.');
});

// Маршрут для получения всех поездок
app.get('/api/trips', (req, res) => {
    db.all("SELECT * FROM trips", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ trips: rows });
    });
});

// Проверка работы сервера
app.get('/', (req, res) => {
    res.send('SAPAR Backend работает и база данных подключена! ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});