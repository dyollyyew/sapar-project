const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene",
        search: "GÖZLEG", popular: "Meşhur ugurlar", buy: "SATYN AL",
        dep: "Uçuş", arr: "Geliş", loading: "Gözlenilýär...", direct: "Gönümel", flight: "Reýs", comm: "+5% hyzmat tölegi goşuldy"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира", from: "Откуда", to: "Куда", date: "Дата",
        search: "ПОИСК", popular: "Популярные направления", buy: "КУПИТЬ",
        dep: "Вылет", arr: "Прилет", loading: "Поиск билетов...", direct: "Прямой", flight: "Рейс", comm: "+5% комиссия сервиса включена"
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

// 1. Календарь
const fp = flatpickr("#date", {
    dateFormat: "d.m.Y",
    minDate: "today",
    defaultDate: "today"
});

// 2. Переключение языка
function changeLang(lang) {
    currentLang = lang;
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');

    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('hero-sub').innerText = dict[lang].sub;
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.getElementById('btn-search').innerText = dict[lang].search;
    document.getElementById('pop-title').innerText = dict[lang].popular;

    if (lastTickets.length > 0) renderTickets(lastTickets);
}

// 3. Автозаполнение
function initAutocomplete(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        box.innerHTML = '';
        if(!val) { box.style.display = 'none'; return; }

        const filtered = cities.filter(c => c.name.toLowerCase().includes(val) || c.code.toLowerCase().includes(val) || c.ru.toLowerCase().includes(val));
        
        if(filtered.length > 0) {
            box.style.display = 'block';
            filtered.forEach(c => {
                const div = document.createElement('div');
                div.className = 'suggest-item';
                div.innerText = `${currentLang === 'tk' ? c.name : c.ru} (${c.code})`;
                div.onclick = () => {
                    input.value = c.code;
                    box.style.display = 'none';
                };
                box.appendChild(div);
            });
        }
    });
}
initAutocomplete('from', 'suggest-from');
initAutocomplete('to', 'suggest-to');

// 4. Поиск
async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) return alert("Error!");

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    // Имитация API запроса
    setTimeout(() => {
        lastTickets = [{
            origin: from.toUpperCase(),
            destination: to.toUpperCase(),
            basePrice: 3200,
            date: date,
            flight: "T5-442"
        }];
        renderTickets(lastTickets);
    }, 1000);
}

// 5. Отрисовка билета и логика покупки
function renderTickets(tickets) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    const lang = dict[currentLang];

    tickets.forEach(t => {
        // Расчет цены с комиссией 5%
        const finalPrice = Math.round(t.basePrice * 1.05);

        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">${t.origin} <i class="fas fa-plane" style="color:#ccc; margin:0 10px;"></i> ${t.destination}</div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">${lang.dep}</div><div class="t-val">17:30</div></div>
                    <div><div class="t-lbl">${lang.arr}</div><div class="t-val">22:50</div></div>
                    <div><div class="t-lbl">Status</div><div class="t-val" style="color:green">${lang.direct}</div></div>
                    <div><div class="t-lbl">${lang.date}</div><div class="t-val">${t.date}</div></div>
                    <div><div class="t-lbl">${lang.flight}</div><div class="t-val">${t.flight}</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price-box">
                        <div class="price">${finalPrice} TMT</div>
                        <div class="comm-info">${lang.comm}</div>
                    </div>
                    <button class="buy-btn" onclick="redirectToAviasales('${t.origin}', '${t.destination}', '${t.date}')">
                        ${lang.buy}
                    </button>
                </div>
            </div>`;
    });
}

// 6. Сложная ссылка на Aviasales
function redirectToAviasales(from, to, date) {
    // Форматируем дату из DD.MM.YYYY в DDMM для ссылки Aviasales
    const parts = date.split('.');
    const formattedDate = parts[0] + parts[1]; 
    
    // Формируем URL: https://www.aviasales.ru/search/ASB1204KZN1 (пример)
    const aviaUrl = `https://www.aviasales.ru/search/${from}${formattedDate}${to}1`;
    
    // В реальности здесь данные пассажира отправляются на ваш сервер (Email/Ticket), 
    // а пользователь летит на оплату.
    window.open(aviaUrl, '_blank');
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