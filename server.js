const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./sapar.db', (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else console.log('База данных SAPAR подключена.');
});

app.get('/', (req, res) => {
    res.send('SAPAR Backend работает чисто! ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер на порту ${PORT}`);
});