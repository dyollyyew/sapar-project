const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'sapar.db'), () => initDB());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sapar.bd@mail.ru', 
        pass: 'web_prilozeniya1' 
    }
});

function initDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT, passport TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY AUTOINCREMENT, departure TEXT, arrival TEXT, time TEXT, airline TEXT, price INTEGER, date TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, trip_id INTEGER, p_name TEXT, p_surname TEXT, p_passport TEXT, total_price REAL, email TEXT, flight_date TEXT, route TEXT)`);

        db.get("SELECT count(*) as c FROM trips", (err, row) => {
            if (row && row.c === 0) {
                const ins = 'INSERT INTO trips (departure, arrival, time, airline, price, date) VALUES (?,?,?,?,?,?)';
                const flights = [
                    // РЕАЛЬНЫЕ РЕЙСЫ TKM AIRLINES & TUTU
                    ["Ashgabat (ASB)", "Moscow (DME)", "07:35", "Turkmenistan Airlines", 3450, "2026-04-05"],
                    ["Ashgabat (ASB)", "Moscow (VKO)", "15:20", "Turkmenistan Airlines", 3450, "2026-04-05"],
                    ["Moscow (DME)", "Ashgabat (ASB)", "11:10", "Turkmenistan Airlines", 3200, "2026-04-10"],
                    ["Ashgabat (ASB)", "Istanbul (IST)", "20:10", "Turkmenistan Airlines", 4100, "2026-04-05"],
                    ["Istanbul (IST)", "Ashgabat (ASB)", "03:45", "Turkish Airlines", 4500, "2026-04-10"],
                    ["Ashgabat (ASB)", "Dubai (DXB)", "12:40", "flydubai", 2900, "2026-04-05"],
                    ["Ashgabat (ASB)", "Kazan (KZN)", "09:00", "Turkmenistan Airlines", 3100, "2026-04-06"],
                    ["Ashgabat (ASB)", "Frankfurt (FRA)", "08:20", "Turkmenistan Airlines", 5800, "2026-04-07"],
                    ["Ashgabat (ASB)", "Delhi (DEL)", "23:55", "Turkmenistan Airlines", 3700, "2026-04-05"],
                    ["Ashgabat (ASB)", "Bangkok (BKK)", "14:10", "Turkmenistan Airlines", 6200, "2026-04-08"]
                ];
                flights.forEach(f => db.run(ins, f));
            }
        });
    });
}

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, passport } = req.body;
    db.run(`INSERT INTO users (name, email, password, passport) VALUES (?,?,?,?)`, [name, email, password, passport], (err) => {
        if (err) return res.status(400).json({ error: "Email exists" });
        res.json({ success: true });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, user) => {
        if (user) res.json({ success: true, user });
        else res.status(401).json({ error: "Fail" });
    });
});

app.get('/api/cities', (req, res) => {
    db.all(`SELECT DISTINCT departure AS city FROM trips UNION SELECT DISTINCT arrival AS city FROM trips`, (err, rows) => res.json(rows.map(r => r.city)));
});

app.get('/api/search', (req, res) => {
    const { from, to, date } = req.query;
    db.all(`SELECT * FROM trips WHERE departure=? AND arrival=? AND date=?`, [from, to, date], (err, rows) => res.json(rows || []));
});

app.post('/api/book', (req, res) => {
    const { trip_id, user_id, name, surname, passport, price, email, route, f_date } = req.body;
    const total = (price * 1.05).toFixed(2);
    db.run(`INSERT INTO bookings (trip_id, user_id, p_name, p_surname, p_passport, total_price, email, flight_date, route) VALUES (?,?,?,?,?,?,?,?,?)`, 
    [trip_id, user_id, name, surname, passport, total, email, f_date, route], function(err) {
        if (err) return res.status(500).json({ success: false });
        const mailOptions = {
            from: 'SAPAR.TM <sapar.bd@mail.ru>',
            to: email,
            subject: 'E-Ticket SAPAR.TM',
            html: `<div style="border:2px solid #00873d; padding:20px;"><h2>SAPAR.TM E-TICKET</h2><p><b>Passenger:</b> ${name} ${surname}</p><p><b>Route:</b> ${route}</p><p><b>Total:</b> ${total} TMT</p></div>`
        };
        transporter.sendMail(mailOptions, () => {});
        res.json({ success: true, total });
    });
});

app.get('/api/admin/all', (req, res) => {
    db.all(`SELECT * FROM bookings`, (err, rows) => res.json(rows));
});

app.get('/api/my-bookings', (req, res) => {
    db.all(`SELECT * FROM bookings WHERE user_id = ?`, [req.query.userId], (err, rows) => res.json(rows));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');