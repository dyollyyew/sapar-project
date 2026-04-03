const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'sapar.db'), () => initDB());

function initDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            departure TEXT, 
            arrival TEXT, 
            dep_code TEXT, 
            arr_code TEXT, 
            time TEXT, 
            airline TEXT, 
            price INTEGER, 
            date TEXT,
            official_url TEXT
        )`);

        db.run("DELETE FROM trips", () => {
            const ins = 'INSERT INTO trips (departure, arrival, dep_code, arr_code, time, airline, price, date, official_url) VALUES (?,?,?,?,?,?,?,?,?)';
            const flights = [
                // Ашхабад - Казань
                ["Ashgabat (ASB)", "Kazan (KZN)", "ASB", "KZN", "09:00", "Turkmenistan Airlines", 3100, "2026-04-05", "https://turkmenistanairlines.ru/"],
                ["Ashgabat (ASB)", "Kazan (KZN)", "ASB", "KZN", "11:30", "Nordwind Airlines", 2950, "2026-04-05", "https://nordwindairlines.ru/"],
                ["Ashgabat (ASB)", "Kazan (KZN)", "ASB", "KZN", "16:00", "S7 Airlines", 4100, "2026-04-05", "https://www.s7.ru/"],
                
                // Внутренние РФ (Теперь ведут на официальные сайты)
                ["Moscow (DME)", "Saint Petersburg (LED)", "MOW", "LED", "10:00", "Aeroflot", 2500, "2026-04-05", "https://www.aeroflot.ru/"],
                ["Moscow (DME)", "Saint Petersburg (LED)", "MOW", "LED", "12:00", "S7 Airlines", 2300, "2026-04-05", "https://www.s7.ru/"],
                ["Moscow (DME)", "Saint Petersburg (LED)", "MOW", "LED", "15:40", "Nordwind Airlines", 2100, "2026-04-05", "https://nordwindairlines.ru/"]
            ];
            flights.forEach(f => db.run(ins, f));
        });
    });
}

app.get('/api/search', (req, res) => {
    const { from, to, date } = req.query;
    db.all(`SELECT * FROM trips WHERE departure = ? AND arrival = ? AND date = ? ORDER BY price ASC`, [from, to, date], (err, rows) => {
        res.json(rows || []);
    });
});

app.get('/api/cities', (req, res) => {
    db.all(`SELECT DISTINCT departure AS city FROM trips UNION SELECT DISTINCT arrival AS city FROM trips`, (err, rows) => {
        res.json(rows ? rows.map(r => r.city) : []);
    });
});

app.listen(3000, '0.0.0.0');