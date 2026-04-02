const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Подключение к БД
const db = new sqlite3.Database('./sapar.db', (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else {
        console.log('База данных подключена.');
        createTable(); // Создаем таблицу сразу при запуске
    }
});

function createTable() {
    // Создаем таблицу trips, если её еще нет
    db.run(`CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        departure TEXT,
        arrival TEXT,
        time TEXT,
        airline TEXT,
        price INTEGER
    )`, (err) => {
        if (err) console.error('Ошибка создания таблицы:', err.message);
        else {
            console.log('Таблица trips готова.');
            seedData(); // Заполняем данными
        }
    });
}

function seedData() {
    // Проверяем, есть ли уже данные, чтобы не дублировать
    db.get("SELECT count(*) as count FROM trips", (err, row) => {
        if (row.count === 0) {
            const insert = 'INSERT INTO trips (departure, arrival, time, airline, price) VALUES (?,?,?,?,?)';
            db.run(insert, ["Ashgabat (ASB)", "Istanbul (IST)", "10:30", "Turkmenistan Airlines", 2450]);
            db.run(insert, ["Ashgabat (ASB)", "Istanbul (IST)", "22:15", "Turkish Airlines", 4100]);
            db.run(insert, ["Ashgabat (ASB)", "Moscow (VKO)", "08:00", "Turkmenistan Airlines", 3200]);
            console.log('Тестовые билеты добавлены в базу!');
        }
    });
}

app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    const sql = `SELECT * FROM trips WHERE departure = ? AND arrival = ?`;
    
    db.all(sql, [from, to], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); 
    });
});

app.get('/', (req, res) => {
    res.send('SAPAR Backend работает и база обновлена! ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер на порту ${PORT}`);
});