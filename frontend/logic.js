// Конфигурация API и Партнерки
const TRAVELPAYOUTS_TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";
const COMMISSION = 1.05; // 5% комиссия

const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene",
        search: "GÖZLEG", popular: "Meşhur ugurlar", buy: "SATYN AL",
        dep: "Uçuş", arr: "Geliş", loading: "Gözlenilýär...", direct: "Gönümel", flight: "Reýs", 
        comm: "+5% hyzmat tölegi goşuldy", error: "Ähli meýdançalary dolduryň!"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира", from: "Откуда", to: "Куда", date: "Дата",
        search: "ПОИСК", popular: "Популярные направления", buy: "КУПИТЬ",
        dep: "Вылет", arr: "Прилет", loading: "Поиск билетов...", direct: "Прямой", flight: "Рейс", 
        comm: "+5% комиссия сервиса включена", error: "Заполните все поля!"
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
let lastTickets = [];

// Данные текущего пассажира (в реальности берутся из формы ввода или профиля)
const passenger = {
    firstName: "SAPAR",
    lastName: "SAPAROW",
    email: "sapar@example.com",
    phone: "+99361234567"
};

// Инициализация календаря
flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today", defaultDate: "today" });

function changeLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-switcher span').forEach(s => s.classList.remove('active'));
    document.getElementById('btn-' + lang).classList.add('active');
    // Обновление текстов (как в предыдущих ответах)
    renderUI();
    if (lastTickets.length > 0) renderTickets(lastTickets);
}

// Автозаполнение
function initAutocomplete(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);
    input.addEventListener('input', () => {
        const val = input.value.toUpperCase();
        box.innerHTML = '';
        if(!val) { box.style.display = 'none'; return; }
        const filtered = cities.filter(c => c.name.toUpperCase().includes(val) || c.code.includes(val) || c.ru.toUpperCase().includes(val));
        if(filtered.length > 0) {
            box.style.display = 'block';
            filtered.forEach(c => {
                const div = document.createElement('div');
                div.className = 'suggest-item';
                div.innerText = `${currentLang === 'tk' ? c.name : c.ru} (${c.code})`;
                div.onclick = () => { input.value = c.code; box.style.display = 'none'; };
                box.appendChild(div);
            });
        }
    });
}
initAutocomplete('from', 'suggest-from');
initAutocomplete('to', 'suggest-to');

// Поиск билетов через API (Travelpayouts)
async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) return alert(dict[currentLang].error);

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    // Здесь имитируем получение данных. Для реального API нужен серверный запрос.
    setTimeout(() => {
        lastTickets = [{
            origin: from,
            destination: to,
            price: 3200, // Базовая цена от авиакомпании
            date: date,
            flight: "T5-442"
        }];
        renderTickets(lastTickets);
    }, 1000);
}

function renderTickets(tickets) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    tickets.forEach(t => {
        const finalPrice = Math.round(t.price * COMMISSION);
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">${t.origin} ✈ ${t.destination}</div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">${dict[currentLang].dep}</div><div class="t-val">10:00</div></div>
                    <div><div class="t-lbl">${dict[currentLang].arr}</div><div class="t-val">14:20</div></div>
                    <div><div class="t-lbl">Reýs</div><div class="t-val">${t.flight}</div></div>
                    <div><div class="t-lbl">Sene</div><div class="t-val">${t.date}</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price-box">
                        <div class="price">${finalPrice} TMT</div>
                        <div class="comm-info">${dict[currentLang].comm}</div>
                    </div>
                    <button class="buy-btn" onclick="bookTicket('${t.origin}', '${t.destination}', '${t.date}')">
                        ${dict[currentLang].buy}
                    </button>
                </div>
            </div>`;
    });
}

// ПЕРЕХОД НА AVIASALES С ДАННЫМИ
function bookTicket(from, to, date) {
    const dateParts = date.split('.');
    const ddmmyy = dateParts[0] + dateParts[1]; // Формат 1204 (12 апреля)
    // Пример добавления в функцию bookTicket
fetch('https://your-api.com/save-order', {
    method: 'POST',
    body: JSON.stringify({ passenger, flight: from + "-" + to, date })
});

    // Формируем Deep Link с маркером и данными пассажира
    const baseUrl = `https://www.aviasales.ru/search/${from}${ddmmyy}${to}1`;
    const params = new URLSearchParams({
        marker: MARKER,
        with_request: "true",
        // Параметры предзаполнения данных (поддерживается многими агентствами через Aviasales)
        email: passenger.email,
        phone: passenger.phone,
        first_name: passenger.firstName,
        last_name: passenger.lastName
    });

    const finalUrl = `${baseUrl}?${params.toString()}`;
    
    // В реальной системе здесь должен быть запрос на ваш Email API, 
    // чтобы данные ушли вам на почту ПЕРЕД переходом.
    console.log("Данные пассажира зафиксированы:", passenger);
    
    window.open(finalUrl, '_blank');
}