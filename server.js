const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'sapar.db');
const db = new sqlite3.Database(dbPath, () => initDB());

function initDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            departure TEXT, arrival TEXT, time TEXT, airline TEXT, price INTEGER, date TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER, passenger_name TEXT, passport TEXT
        )`);

        db.get("SELECT count(*) as count FROM trips", (err, row) => {
            if (row && row.count === 0) {
                const ins = 'INSERT INTO trips (departure, arrival, time, airline, price, date) VALUES (?,?,?,?,?,?)';
                
                // РЕАЛЬНЫЕ РЕЙСЫ (Примерные данные из расписания Turkmenistan Airlines & Tutu)
                const flights = [
                    ["Ashgabat (ASB)", "Moscow (DME)", "07:35", "Turkmenistan Airlines", 3450, "2026-04-05"],
                    ["Moscow (DME)", "Ashgabat (ASB)", "11:10", "Turkmenistan Airlines", 3200, "2026-04-10"],
                    ["Ashgabat (ASB)", "Istanbul (IST)", "20:10", "Turkish Airlines", 4200, "2026-04-05"],
                    ["Istanbul (IST)", "Ashgabat (ASB)", "03:45", "Turkish Airlines", 3900, "2026-04-12"],
                    ["Ashgabat (ASB)", "Kazan (KZN)", "10:00", "Turkmenistan Airlines", 3100, "2026-04-06"],
                    ["Ashgabat (ASB)", "Dubai (DXB)", "15:20", "flydubai", 2800, "2026-04-05"],
                    ["Ashgabat (ASB)", "Frankfurt (FRA)", "09:15", "Turkmenistan Airlines", 5600, "2026-04-07"]
                ];

                flights.forEach(f => db.run(ins, f));
                console.log("Database updated with real flights!");
            }
        });
    });
}

app.get('/api/cities', (req, res) => {
    db.all(`SELECT DISTINCT departure AS city FROM trips UNION SELECT DISTINCT arrival AS city FROM trips`, (err, rows) => {
        res.json(rows ? rows.map(r => r.city) : []);
    });
});

app.get('/api/search', (req, res) => {
    const { from, to, date } = req.query;
    db.all(`SELECT * FROM trips WHERE departure = ? AND arrival = ? AND date = ?`, [from, to, date], (err, rows) => {
        res.json(rows || []);
    });
});

app.post('/api/book', (req, res) => {
    const { trip_id, name, passport } = req.body;
    db.run(`INSERT INTO bookings (trip_id, passenger_name, passport) VALUES (?, ?, ?)`, [trip_id, name, passport], function(err) {
        res.json({ success: !err, id: this.lastID });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));