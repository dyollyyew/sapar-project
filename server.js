const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Путь к файлу базы данных в корне проекта
const dbPath = path.resolve(__dirname, 'sapar.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Ошибка подключения к БД:', err.message);
    else {
        console.log('База данных SAPAR подключена.');
        initializeDatabase(); // Запуск создания структуры
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Создаем таблицу trips
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
                console.log('Таблица trips проверена/создана.');
                seedTrips(); // Добавляем данные
            }
        });
    });
}

function seedTrips() {
    db.get("SELECT count(*) as count FROM trips", (err, row) => {
        if (!err && row.count === 0) {
            console.log('База пуста. Добавляю тестовые билеты...');
            const insert = 'INSERT INTO trips (departure, arrival, time, airline, price) VALUES (?,?,?,?,?)';
            
            // Важно: города должны СТРОГО совпадать с именами в index.html
            db.run(insert, ["Ashgabat (ASB)", "Istanbul (IST)", "10:30", "Turkmenistan Airlines", 2450]);
            db.run(insert, ["Ashgabat (ASB)", "Istanbul (IST)", "22:15", "Turkish Airlines", 4100]);
            db.run(insert, ["Ashgabat (ASB)", "Moscow (VKO)", "08:00", "Turkmenistan Airlines", 3200]);
            db.run(insert, ["Istanbul (IST)", "Ashgabat (ASB)", "15:45", "Turkish Airlines", 3950]);
            
            console.log('Данные успешно загружены!');
        }
    });
}

// Маршрут для поиска
app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    console.log(`Поиск: ${from} -> ${to}`);

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
    res.send('SAPAR Backend готов и база данных заполнена! ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});