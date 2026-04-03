const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'sapar.db'), () => initDB());

// Настройка почты (Вставь свои данные Gmail)
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
        db.run(`CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, trip_id INTEGER, p_name TEXT, p_surname TEXT, p_passport TEXT, total_price REAL, email TEXT, flight_date TEXT, route TEXT, status TEXT)`);

        db.get("SELECT count(*) as c FROM trips", (err, row) => {
            if (row && row.c === 0) {
                const ins = 'INSERT INTO trips (departure, arrival, time, airline, price, date) VALUES (?,?,?,?,?,?)';
                db.run(ins, ["Ashgabat (ASB)", "Moscow (DME)", "07:35", "Turkmenistan Airlines", 3450, "2026-04-05"]);
                db.run(ins, ["Ashgabat (ASB)", "Istanbul (IST)", "20:10", "Turkmenistan Airlines", 4100, "2026-04-05"]);
                db.run(ins, ["Ashgabat (ASB)", "Dubai (DXB)", "12:40", "flydubai", 2900, "2026-04-05"]);
                db.run(ins, ["Ashgabat (ASB)", "Kazan (KZN)", "09:00", "Turkmenistan Airlines", 3100, "2026-04-06"]);
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

// ПЛАТЕЖ ЧЕРЕЗ МИР
app.post('/api/pay-mir', (req, res) => {
    const { trip_id, user_id, name, surname, passport, price, email, route, f_date, card_number } = req.body;
    const total = (price * 1.05).toFixed(2);
    
    // Эмуляция проверки карты МИР (должна начинаться на 2)
    if(!card_number.startsWith('2')) {
        return res.status(400).json({ success: false, message: "Только карты МИР (начинаются на 2)" });
    }

    setTimeout(() => {
        db.run(`INSERT INTO bookings (trip_id, user_id, p_name, p_surname, p_passport, total_price, email, flight_date, route, status) VALUES (?,?,?,?,?,?,?,?,?,'Paid via MIR')`, 
        [trip_id, user_id, name, surname, passport, total, email, f_date, route], function(err) {
            
            const mailOptions = {
                from: 'SAPAR.TM <sapar.bd@mail.ru>',
                to: email,
                subject: 'Bilediňiz tassyklanyldy / Билет подтвержден',
                html: `<div style="border:3px solid #224099; padding:20px; border-radius:10px;">
                    <h2 style="color:#224099;">MIR — SAPAR.TM</h2>
                    <p><b>Passenger:</b> ${name} ${surname}</p>
                    <p><b>Route:</b> ${route}</p>
                    <p><b>Status:</b> OPLACHENO (MIR)</p>
                    <p><b>Total:</b> ${total} TMT</p>
                </div>`
            };
            transporter.sendMail(mailOptions, () => {});
            res.json({ success: true });
        });
    }, 1500);
});

app.get('/api/my-bookings', (req, res) => {
    db.all(`SELECT * FROM bookings WHERE user_id = ?`, [req.query.userId], (err, rows) => res.json(rows));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');