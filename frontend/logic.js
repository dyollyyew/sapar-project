const MARKER = "716446";
const COMMISSION = 1.05;

const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene",
        search: "GÖZLEG", popular: "Meşhur ugurlar", profile: "Profil", buy: "SATYN AL",
        loading: "Gözlenilýär...", saved: "Siziň maglumatlaryňyz ýazdyryldy!", modal: "Yolagçy Profili",
        error: "Sene ýalňyş ýa-da bilet tapylmady"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира", from: "Откуда", to: "Куда", date: "Дата",
        search: "ПОИСК", popular: "Популярные направления", profile: "Профиль", buy: "КУПИТЬ",
        loading: "Поиск билетов...", saved: "Ваши данные успешно сохранены!", modal: "Данные пассажира",
        error: "Ошибка даты или билеты не найдены"
    }
};

const cities = [
    { name: "Ashgabat", code: "ASB", ru: "Ашхабад" },
    { name: "Kazan", code: "KZN", ru: "Казань" },
    { name: "Moscow", code: "VKO", ru: "Москва" },
    { name: "Istanbul", code: "IST", ru: "Стамбул" },
    { name: "Dubai", code: "DXB", ru: "Дубай" }
];

let currentLang = 'tk';

// 1. Инициализация календаря (ИСПРАВЛЕН ФОРМАТ ДАТЫ ДЛЯ API)
flatpickr("#date", { 
    dateFormat: "Y-m-d", 
    minDate: "today",
    disableMobile: "true"
});

// 2. Смена языка
function changeLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-switcher span').forEach(s => s.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('hero-sub').innerText = dict[lang].sub;
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.querySelector('.btn-search').innerText = dict[lang].search;
    document.getElementById('pop-title').innerText = dict[lang].popular;
    document.getElementById('txt-profile').innerText = dict[lang].profile;
    document.getElementById('modal-title').innerText = dict[lang].modal;
}

// 3. Подсказки городов
function setupSuggest(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);
    
    input.oninput = () => {
        const val = input.value.toLowerCase();
        box.innerHTML = '';
        if(!val || val.length < 1) { box.style.display = 'none'; return; }
        
        const filtered = cities.filter(c => 
            c.name.toLowerCase().includes(val) || 
            c.ru.toLowerCase().includes(val) || 
            c.code.toLowerCase().includes(val)
        );

        if(filtered.length > 0) {
            box.style.display = 'block';
            filtered.forEach(c => {
                const div = document.createElement('div');
                div.className = 'suggest-item';
                const fullName = currentLang === 'tk' ? c.name : c.ru;
                div.innerText = `${fullName} (${c.code})`;
                div.onclick = () => {
                    input.value = `${fullName} (${c.code})`;
                    box.style.display = 'none';
                };
                box.appendChild(div);
            });
        }
    };
    document.addEventListener('click', (e) => { if (e.target !== input) box.style.display = 'none'; });
}
setupSuggest('from', 'suggest-from');
setupSuggest('to', 'suggest-to');

// 4. ГЛАВНАЯ ФУНКЦИЯ ПОИСКА (Интеграция с вашим Бэкендом)
async function runSearch() {
    const fromVal = document.getElementById('from').value;
    const toVal = document.getElementById('to').value;
    const date = document.getElementById('date').value;

    if (!fromVal || !toVal || !date) return alert("Dolduryň!");

    const resBox = document.getElementById('results-list');
    const popSection = document.querySelector('.popular-section');
    
    if(popSection) popSection.style.display = 'none';
    resBox.innerHTML = `<div style="text-align:center; padding:30px;">${dict[currentLang].loading}</div>`;

    // Вырезаем IATA код (например "ASB")
    const origin = fromVal.match(/\((.*?)\)/) ? fromVal.match(/\((.*?)\)/)[1] : fromVal;
    const destination = toVal.match(/\((.*?)\)/) ? toVal.match(/\((.*?)\)/)[1] : toVal;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination, date })
        });

        const data = await response.json();

        if (data.success && data.tickets && data.tickets.length > 0) {
            resBox.innerHTML = ''; 
            data.tickets.forEach(t => {
                const price = Math.round(t.price * COMMISSION);
                resBox.innerHTML += `
                <div style="background:#fff; border-radius:12px; padding:20px; margin:20px auto; max-width:850px; box-shadow:0 4px 15px rgba(0,0,0,0.1); border-left:6px solid #008755;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="color:#008755; font-weight:bold;">Reýs #${t.flight_number}</span>
                        <span style="color:#888;">${t.airline}</span>
                    </div>
                    <div style="font-size:22px; font-weight:bold; margin-bottom:15px;">
                        ${t.origin} <span style="color:#008755;">✈</span> ${t.destination}
                        <small style="font-weight:normal; font-size:14px; color:#666; margin-left:10px;">${new Date(t.departure_at).toLocaleDateString()}</small>
                    </div>
                 <button onclick="buyTicket('${t.origin}', '${t.destination}', '${date}')" 
            class="btn-search" 
            style="height:40px; padding:0 20px;">
        ${dict[currentLang].buy}
    </button>
                </div>`;
            });
        } else {
            resBox.innerHTML = `<div style="text-align:center; padding:30px;">${dict[currentLang].error}</div>`;
        }
    } catch (err) {
        console.error(err);
        resBox.innerHTML = `<div style="text-align:center; padding:30px; color:red;">Сервер недоступен</div>`;
    }
}

// 5. Привязка клика при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.onclick = runSearch;
    }
});

// Функции-помощники
function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    const temp = f.value;
    f.value = t.value;
    t.value = temp;
}

function fill(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openProfile() { document.getElementById('profile-modal').style.display = 'flex'; }
function closeProfile() { document.getElementById('profile-modal').style.display = 'none'; }

function saveProfile() {
    const data = {
        name: document.getElementById('p-name').value,
        surname: document.getElementById('p-surname').value,
        email: document.getElementById('p-email').value
    };
    if(!data.name || !data.surname) return alert("Dolduryň!");
    localStorage.setItem('user_data', JSON.stringify(data));
    showToast(dict[currentLang].saved);
    closeProfile();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
function buyTicket(origin, destination, date) {
    // Формируем ссылку для партнерской программы Aviasales
    // Формат: aviasales.ru/search/MOW2604ASB1
    
    // Очищаем дату от дефисов (из 2026-04-26 делаем 2604)
    const d = date.split('-'); 
    const dateFormatted = d[2] + d[1]; // Получаем "2604"

    const url = `https://www.aviasales.ru/search/${origin}${dateFormatted}${destination}1?marker=${MARKER}`;
    
    // Открываем в новой вкладке
    window.open(url, '_blank');
}
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors'); // Добавлено для работы запросов
require('dotenv').config();

const app = express();

// Настройки
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// API Маршрут
app.post('/api/search-live', async (req, res) => {
 const { origin, destination, date } = req.body;
 
 // Используем токен из .env или системный
 const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || "23a9b11bc2672f0692432adc75cfc003";

 // Проверка входных данных
 if (!origin || !destination || !date) {
 return res.status(400).json({ error: "Отсутствуют обязательные параметры (origin, destination, date)" });
 }

 try {
 console.log(`🔎 Поиск: ${origin} -> ${destination} на ${date}`);

 const response = await axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
 params: {
 origin: origin.toUpperCase(),
 destination: destination.toUpperCase(),
 departure_at: date, // Ожидается формат YYYY-MM или YYYY-MM-DD
 unique: 'false',
 sorting: 'price',
 direct: 'false',
 currency: 'rub', // Можно сменить на 'usd' для стабильности
 limit: 30,
 token: TOKEN
 },
 timeout: 10000 // Ждем ответ не более 10 секунд
 });

 // Отправляем данные фронтенду
 res.json({ 
 success: true,
 tickets: response.data.data || [] 
 });

 } catch (error) {
 console.error("❌ Ошибка API Aviasales:", error.response?.data || error.message);
 
// Отправляем понятную ошибку клиенту
 res.status(500).json({ 
 success: false,
 error: "Не удалось получить данные от авиакомпаний",
 details: error.response?.data?.message || error.message
 });
 }
});

// Для всех остальных запросов отдаем index.html (SPA поддержка)
app.get('*', (req, res) => {
 res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`----------------------------------`);
 console.log(`🚀 SAPAR Server running on port ${PORT}`);
 console.log(`📂 Static files: ${path.join(__dirname, 'frontend')}`);
 console.log(`----------------------------------`);
});