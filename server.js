const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'sapar.db'), () => {
    db.serialize(() => {
        // Рейсы
        db.run(`CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY, departure TEXT, arrival TEXT, time TEXT, airline TEXT, price INTEGER, date TEXT)`);
        // Пользователи
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, passport TEXT)`);
        // Бронирования
        db.run(`CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, user_id INTEGER, trip_id INTEGER, p_name TEXT, p_surname TEXT, p_passport TEXT, total_price REAL, status TEXT DEFAULT 'Paid')`);

        // Seed real flights
        db.get("SELECT count(*) as c FROM trips", (err, row) => {
            if (row.c === 0) {
                const ins = 'INSERT INTO trips (departure, arrival, time, airline, price, date) VALUES (?,?,?,?,?,?)';
                db.run(ins, ["Ashgabat (ASB)", "Moscow (DME)", "07:35", "Turkmenistan Airlines", 3450, "2026-04-05"]);
                db.run(ins, ["Ashgabat (ASB)", "Istanbul (IST)", "20:10", "Turkish Airlines", 4200, "2026-04-05"]);
                db.run(ins, ["Istanbul (IST)", "Ashgabat (ASB)", "03:45", "Turkmenistan Airlines", 3900, "2026-04-10"]);
            }
        });
    });
});

// API: Поиск
app.get('/api/search', (req, res) => {
    const { from, to, date } = req.query;
    db.all(`SELECT * FROM trips WHERE departure=? AND arrival=? AND date=?`, [from, to, date], (err, rows) => res.json(rows || []));
});

// API: Бронирование с комиссией 5%
app.post('/api/book', (req, res) => {
    const { trip_id, name, surname, passport, price } = req.body;
    const total = (price * 1.05).toFixed(2); // Комиссия 5%
    db.run(`INSERT INTO bookings (trip_id, p_name, p_surname, p_passport, total_price) VALUES (?,?,?,?,?)`, 
    [trip_id, name.toUpperCase(), surname.toUpperCase(), passport.toUpperCase(), total], function(err) {
        res.json({ success: !err, bookingId: this.lastID, total });
    });
});

// API: Админка (Все брони)
app.get('/api/admin/bookings', (req, res) => {
    db.all(`SELECT b.*, t.departure, t.arrival, t.time FROM bookings b JOIN trips t ON b.trip_id = t.id`, (err, rows) => res.json(rows));
});

app.get('/api/cities', (req, res) => {
    db.all(`SELECT DISTINCT departure AS city FROM trips UNION SELECT DISTINCT arrival AS city FROM trips`, (err, rows) => res.json(rows.map(r => r.city)));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');