const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'sapar.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else {
        console.log('База данных подключена.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                departure TEXT,
                arrival TEXT,
                time TEXT,
                airline TEXT,
                price INTEGER
            )`);
            
            db.get("SELECT count(*) as count FROM trips", (err, row) => {
                if (row && row.count === 0) {
                    const ins = 'INSERT INTO trips (departure, arrival, time, airline, price) VALUES (?,?,?,?,?)';
                    db.run(ins, ["Ashgabat (ASB)", "Istanbul (IST)", "10:30", "Turkmenistan Airlines", 2450]);
                    db.run(ins, ["Ashgabat (ASB)", "Moscow (VKO)", "08:00", "Turkmenistan Airlines", 3200]);
                    console.log('Начальные данные добавлены.');
                }
            });
        });
    }
});

app.get('/api/cities', (req, res) => {
    db.all(`SELECT DISTINCT departure AS city FROM trips UNION SELECT DISTINCT arrival AS city FROM trips`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => row.city));
    });
});

app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    db.all(`SELECT * FROM trips WHERE departure = ? AND arrival = ?`, [from, to], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/', (req, res) => res.send('SAPAR API Online ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Сервер на порту ${PORT}`));