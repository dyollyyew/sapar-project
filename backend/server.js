const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Подключаем базу данных
const db = new sqlite3.Database('./sapar.db');

// Создаем таблицы, если их нет
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        fio TEXT, passport TEXT, route TEXT, price TEXT, date TEXT DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS flights (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        from_city TEXT, to_city TEXT, time TEXT, base_price REAL
    )`);

    // Добавляем тестовые рейсы (только если таблица пустая)
    db.get("SELECT count(*) as count FROM flights", (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO flights (from_city, to_city, time, base_price) VALUES 
                ('Ashgabat', 'Istanbul', '10:30', 4500),
                ('Ashgabat', 'Moscow', '15:00', 5200),
                ('Mary', 'Ashgabat', '08:00', 150)`);
        }
    });
});

// 1. Поиск билетов
app.get('/api/search', (req, res) => {
    const { from, to } = req.query;
    db.all("SELECT * FROM flights WHERE from_city = ? AND to_city = ?", [from, to], (err, rows) => {
        res.json(rows || []);
    });
});

// 2. Бронирование (только в Базу Данных)
app.post('/api/book', (req, res) => {
    const { fio, passport, route, price } = req.body;
    const sql = `INSERT INTO orders (fio, passport, route, price) VALUES (?, ?, ?, ?)`;
    db.run(sql, [fio, passport, route, price], function(err) {
        if (err) return res.status(500).json({ success: false });
        console.log(`✅ Новый заказ получен! ID: ${this.lastID}`);
        res.json({ success: true, orderId: this.lastID });
    });
});

// 3. Список заказов для админки
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
        res.json(rows || []);
    });
});
// Удалить заказ
app.delete('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM orders WHERE id = ?`, id, (err) => {
        res.json({ success: !err });
    });
});

// Получить список ВСЕХ рейсов (для управления в админке)
app.get('/api/flights/all', (req, res) => {
    db.all("SELECT * FROM flights", [], (err, rows) => res.json(rows || []));
});

// Удалить рейс
app.delete('/api/flights/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM flights WHERE id = ?`, id, (err) => {
        res.json({ success: !err });
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
app.listen(3000, () => console.log('🚀 Сервер SAPAR запущен на порту 3000 (БЕЗ ТЕЛЕГРАМА)'));