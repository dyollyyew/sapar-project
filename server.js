const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'sapar.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('DB Error:', err.message);
    else {
        console.log('Database connected.');
        initDB();
    }
});

function initDB() {
    db.serialize(() => {
        // Создаем таблицу с колонкой date
        db.run(`CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            departure TEXT,
            arrival TEXT,
            time TEXT,
            airline TEXT,
            price INTEGER,
            date TEXT
        )`);

        db.get("SELECT count(*) as count FROM trips", (err, row) => {
            if (row && row.count === 0) {
                const ins = 'INSERT INTO trips (departure, arrival, time, airline, price, date) VALUES (?,?,?,?,?,?)';
                // Рейсы на 5 апреля
                db.run(ins, ["Ashgabat (ASB)", "Istanbul (IST)", "10:30", "Turkmenistan Airlines", 2450, "2026-04-05"]);
                db.run(ins, ["Ashgabat (ASB)", "Istanbul (IST)", "22:15", "Turkish Airlines", 4100, "2026-04-05"]);
                // Рейсы на 6 апреля
                db.run(ins, ["Ashgabat (ASB)", "Moscow (VKO)", "08:00", "Turkmenistan Airlines", 3200, "2026-04-06"]);
                db.run(ins, ["Istanbul (IST)", "Ashgabat (ASB)", "15:45", "Turkish Airlines", 3950, "2026-04-06"]);
                console.log('Database seeded with dates.');
            }
        });
    });
}

app.get('/api/cities', (req, res) => {
    const sql = `SELECT DISTINCT departure AS city FROM trips UNION SELECT DISTINCT arrival AS city FROM trips`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows.map(row => row.city));
    });
});

app.get('/api/search', (req, res) => {
    const { from, to, date } = req.query; // Теперь принимаем и дату
    const sql = `SELECT * FROM trips WHERE departure = ? AND arrival = ? AND date = ?`;
    db.all(sql, [from, to, date], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/', (req, res) => res.send('SAPAR API v2 (Dates) Online ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));