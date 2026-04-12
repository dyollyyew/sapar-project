const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

const translations = {
    tk: { welcome: "Hoş geldiňiz!", from: "Nireden", to: "Nirä", date: "Sene", search: "GÖZLEG", popular: "Meşhur ugurlar", profile: "Profil", save: "Ýazdyr", error: "Bilet tapylmady" },
    ru: { welcome: "Добро пожаловать!", from: "Откуда", to: "Куда", date: "Дата", search: "ПОИСК", popular: "Популярные направления", profile: "Профиль", save: "Сохранить", error: "Билеты не найдены" }
};

let currentLang = 'tk';

// Инициализация календаря
flatpickr("#date", { dateFormat: "Y-m-d", defaultDate: "today" });

// Смена языка
function setLang(lang) {
    currentLang = lang;
    document.getElementById('lang-tk').className = (lang === 'tk' ? 'active' : '');
    document.getElementById('lang-ru').className = (lang === 'ru' ? 'active' : '');
    
    document.getElementById('welcome-text').innerText = translations[lang].welcome;
    document.getElementById('lbl-from').innerText = translations[lang].from;
    document.getElementById('lbl-to').innerText = translations[lang].to;
    document.getElementById('lbl-date').innerText = translations[lang].date;
    document.getElementById('btn-search').innerText = translations[lang].search;
    document.getElementById('popular-title').innerText = translations[lang].popular;
    document.getElementById('lk-title').innerText = translations[lang].profile;
}

// Модальное окно профиля
function toggleModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = (modal.style.display === 'flex' ? 'none' : 'flex');
}

function saveProfile() {
    const name = document.getElementById('u-name').value;
    if(name) {
        localStorage.setItem('user_name', name);
        document.getElementById('user-display').innerText = name;
        toggleModal();
    }
}

// Поиск билетов через API (Исправлено на RUB)
async function searchFlights() {
    const from = document.getElementById('from').value.toUpperCase();
    const to = document.getElementById('to').value.toUpperCase();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if(!from || !to || !date) return alert("Заполните поля!");

    document.getElementById('popular-section').style.display = 'none';
    resDiv.innerHTML = "<center>Поиск...</center>";

    try {
        // Используем рабочий эндпоинт для цен в RUB
        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        const response = await fetch(url);
        const json = await response.json();

        if(!json.data || json.data.length === 0) {
            resDiv.innerHTML = `<center>${translations[currentLang].error}</center>`;
            return;
        }

        render(json.data, from, to);
    } catch (e) {
        resDiv.innerHTML = "<center style='color:red;'>API Error. Проверьте токен или интернет.</center>";
    }
}

function render(data, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";
    
    data.slice(0, 5).forEach((f, i) => {
        let label = i === 0 ? "Самый дешевый" : (i === 1 ? "Оптимальный" : "");
        let color = i === 0 ? "#008755" : "#007bff";
        
        resDiv.innerHTML += `
            <div class="ticket">
                ${label ? `<div class="badge" style="background:${color}">${label}</div>` : ''}
                <div>
                    <img src="https://pics.avs.io/100/40/${f.airline}.png"><br>
                    <b>${from} ✈ ${to}</b><br>
                    <small>Рейс: ${f.flight_number}</small>
                </div>
                <div style="text-align:right">
                    <h2 style="margin:0; color:#333;">${f.price.toLocaleString()} ₽</h2>
                    <button class="btn-main" onclick="window.open('https://www.aviasales.ru${f.link}&marker=${MARKER}')">КУПИТЬ</button>
                </div>
            </div>`;
    });
}

// Автозаполнение при клике на картинку
function quickSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    searchFlights();
}

// Смена местами
function swapCities() {
    let f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

// Загрузка имени из памяти
window.onload = () => {
    const saved = localStorage.getItem('user_name');
    if(saved) document.getElementById('user-display').innerText = saved;
};