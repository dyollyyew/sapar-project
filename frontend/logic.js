const MARKER = "716446";
const dict = {
    tk: { 
        title: "HOŞ GELDIŇIZ!", from: "Nireden", to: "Nirä", date: "Sene", search: "GÖZLEG", 
        pop: "Meşhur ugurlar", buy: "SATYN AL", loading: "Gözlenilýär...", comm: "+5% hyzmat tölegi goşuldy" 
    },
    ru: { 
        title: "ДОБРО ПОЖАЛОВАТЬ!", from: "Откуда", to: "Куда", date: "Дата", search: "ПОИСК", 
        pop: "Популярные направления", buy: "КУПИТЬ", loading: "Поиск билетов...", comm: "+5% комиссия включена" 
    }
};

const cities = [
    { name: "Ashgabat", code: "ASB", ru: "Ашхабад" },
    { name: "Kazan", code: "KZN", ru: "Казань" },
    { name: "Moscow", code: "DME", ru: "Москва" },
    { name: "Istanbul", code: "IST", ru: "Стамбул" },
    { name: "Dubai", code: "DXB", ru: "Дубай" }
];

let currentLang = 'tk';

// Инициализация календаря
const fp = flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today", defaultDate: "today" });

// 1. Функция поиска названия города
function getCityName(code) {
    const city = cities.find(c => c.code === code.toUpperCase());
    return city ? (currentLang === 'tk' ? city.name : city.ru) : code;
}

// 2. Личный кабинет: Сохранение данных
function toggleModal(show) {
    document.getElementById('lk-modal').style.display = show ? 'flex' : 'none';
}

function saveUser() {
    const fio = document.getElementById('u-fio').value.trim();
    const pass = document.getElementById('u-pass').value.trim();
    if (!fio || !pass) return alert("Maglumatlary dolduryň!");
    
    localStorage.setItem('sap_user', JSON.stringify({ fio, pass }));
    document.getElementById('user-btn').innerText = fio.split(' ')[0]; // Показываем только имя
    toggleModal(false);
}

// Проверка ЛК при загрузке
window.onload = () => {
    const saved = localStorage.getItem('sap_user');
    if (saved) {
        const u = JSON.parse(saved);
        document.getElementById('user-btn').innerText = u.fio.split(' ')[0];
    }
};

// 3. Поиск билетов через бэкенд
async function runSearch() {
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const dateStr = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !dateStr) return alert("Error: Dolduryň!");

    const [d, m, y] = dateStr.split('.');
    const apiDate = `${y}-${m}-${d}`; // Формат для API

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: from, destination: to, date: apiDate })
        });
        const data = await response.json();
        renderTickets(data.tickets, from, to, dateStr);
    } catch (err) {
        resBox.innerHTML = `<center style="color:red; padding:50px;">API Connection Error</center>`; //
    }
}

// 4. Отрисовка билетов
function renderTickets(tickets, fromCode, toCode, dateStr) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    const fromName = getCityName(fromCode);
    const toName = getCityName(toCode);

    if (!tickets || tickets.length === 0) {
        resBox.innerHTML = "<center style='padding:40px;'>Bilet tapylmady.</center>";
        return;
    }

    tickets.forEach(t => {
        const finalPrice = Math.round(t.price * 1.05); // Наценка 5%
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">
                    <img src="https://pics.avs.io/100/35/${t.airline}.png"> 
                    <span>${fromName}</span> ✈ <span>${toName}</span>
                </div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">Reýs</div><div class="t-val">${t.flight_number}</div></div>
                    <div><div class="t-lbl">Sene</div><div class="t-val">${dateStr}</div></div>
                    <div><div class="t-lbl">Status</div><div class="t-val" style="color:green">Gönümel</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price-box">
                        <div class="price">${finalPrice.toLocaleString()} RUB</div>
                        <div class="comm-info">${dict[currentLang].comm}</div>
                    </div>
                    <button class="buy-btn" onclick="handleBuy('${t.link}')">${dict[currentLang].buy}</button>
                </div>
            </div>`;
    });
}

function handleBuy(link) {
    if (!localStorage.getItem('sap_user')) {
        alert("Bilet almak üçin Profil maglumatlaryny dolduryň!");
        toggleModal(true);
        return;
    }
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}

// Вспомогательные функции
function changeLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-switcher span').forEach(s => s.classList.remove('active'));
    document.getElementById('btn-' + lang).classList.add('active');
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('btn-search').innerText = dict[lang].search;
    // ... обновить остальные заголовки
}

function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

function setQuickSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    runSearch();
}