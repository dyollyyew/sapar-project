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
const fp = flatpickr("#date", { 
    dateFormat: "d.m.Y", 
    minDate: "today", 
    defaultDate: "today",
    locale: "ru" // или "tk" если есть файл локализации
});

// 1. Поиск названия города (улучшено)
function getCityName(code) {
    if (!code) return "";
    const city = cities.find(c => c.code === code.toUpperCase().trim());
    return city ? (currentLang === 'tk' ? city.name : city.ru) : code.toUpperCase();
}

// 2. Личный кабинет
function toggleModal(show) {
    const modal = document.getElementById('lk-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function saveUser() {
    const fio = document.getElementById('u-fio').value.trim();
    const pass = document.getElementById('u-pass').value.trim();
    if (!fio || !pass) return alert("Maglumatlary dolduryň!");
    
    localStorage.setItem('sap_user', JSON.stringify({ fio, pass }));
    
    const userBtn = document.getElementById('user-btn');
    if (userBtn) userBtn.innerText = fio.split(' ')[0];
    
    toggleModal(false);
}

// 3. Поиск билетов (исправлена обработка ошибок и форматирование)
async function runSearch() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const dateInput = document.getElementById('date');
    const resBox = document.getElementById('results-list');

    const from = fromInput.value.toUpperCase().trim();
    const to = toInput.value.toUpperCase().trim();
    const dateStr = dateInput.value;

    if(!from || !to || !dateStr) return alert("Error: Dolduryň!");

    // Конвертация даты DD.MM.YYYY -> YYYY-MM-DD
    const parts = dateStr.split('.');
    const apiDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 

    const popSection = document.getElementById('popular-section');
    if (popSection) popSection.style.display = 'none';
    
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: from, destination: to, date: apiDate })
        });
        
        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        renderTickets(data.tickets, from, to, dateStr);
    } catch (err) {
        resBox.innerHTML = `<center style="color:red; padding:50px;">API Connection Error. Check Token/Internet.</center>`;
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
        const finalPrice = Math.round(t.price * 1.05);
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">
                    <img src="https://pics.avs.io/100/35/${t.airline}.png" alt="Airline"> 
                    <span>${fromName}</span> ✈ <span>${toName}</span>
                </div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">${currentLang === 'tk' ? 'Reýs' : 'Рейс'}</div><div class="t-val">${t.flight_number}</div></div>
                    <div><div class="t-lbl">${currentLang === 'tk' ? 'Sene' : 'Дата'}</div><div class="t-val">${dateStr}</div></div>
                    <div><div class="t-lbl">Status</div><div class="t-val" style="color:green">${currentLang === 'tk' ? 'Gönümel' : 'Прямой'}</div></div>
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
        alert(currentLang === 'tk' ? "Bilet almak üçin Profil maglumatlaryny dolduryň!" : "Для покупки билета заполните профиль!");
        toggleModal(true);
        return;
    }
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}

// 5. Полное переключение языка (исправлено)
function changeLang(lang) {
    currentLang = lang;
    
    // Активные кнопки
    document.querySelectorAll('.lang-switcher span').forEach(s => s.classList.remove('active'));
    const activeLangBtn = document.getElementById('btn-' + lang);
    if (activeLangBtn) activeLangBtn.classList.add('active');

    // Текстовые блоки
    const elements = {
        'hero-title': dict[lang].title,
        'lbl-from': dict[lang].from,
        'lbl-to': dict[lang].to,
        'lbl-date': dict[lang].date,
        'btn-search': dict[lang].search,
        'pop-title': dict[lang].pop
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = elements[id];
    }
}

function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    const temp = f.value;
    f.value = t.value;
    t.value = temp;
}

function setQuickSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    runSearch();
}

// Загрузка данных
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('sap_user');
    if (saved) {
        const u = JSON.parse(saved);
        const userBtn = document.getElementById('user-btn');
        if (userBtn) userBtn.innerText = u.fio.split(' ')[0];
    }
});