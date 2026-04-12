const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene",
        search: "GÖZLEG", popular: "Meşhur ugurlar", cabinet: "Giriş", buy: "SATYN AL",
        dep: "Uçuş", arr: "Geliş", loading: "Gözlenilýär...", direct: "Gönümel", flight: "Reýs", rules: "Tarif düzgünleri", time: "Ýolda"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира", from: "Откуда", to: "Куда", date: "Дата",
        search: "ПОИСК", popular: "Популярные направления", cabinet: "Вход", buy: "КУПИТЬ",
        dep: "Вылет", arr: "Прилет", loading: "Поиск билетов...", direct: "Прямой", flight: "Рейс", rules: "Правила тарифа", time: "В пути"
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

// Инициализация календаря
flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today" });

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
    document.getElementById('txt-cabinet').innerText = dict[lang].cabinet;

    // Если билет уже на экране - переводим его
    if (lastTickets.length > 0) renderTickets(lastTickets);
}

function setupSuggest(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);

    input.oninput = () => {
        const val = input.value.toLowerCase();
        box.innerHTML = '';
        if(!val) { box.style.display = 'none'; return; }

        const filtered = cities.filter(c => c.name.toLowerCase().includes(val) || c.ru.toLowerCase().includes(val) || c.code.toLowerCase().includes(val));
        if(filtered.length > 0) {
            box.style.display = 'block';
            filtered.forEach(c => {
                const div = document.createElement('div');
                div.className = 'suggest-item';
                const name = currentLang === 'tk' ? c.name : c.ru;
                div.innerText = `${name} (${c.code})`;
                div.onclick = () => {
                    input.value = `${name} (${c.code})`;
                    box.style.display = 'none';
                };
                box.appendChild(div);
            });
        }
    };
}
setupSuggest('from', 'suggest-from');
setupSuggest('to', 'suggest-to');

async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) return alert(currentLang === 'tk' ? "Ähli meýdançalary dolduryň!" : "Заполните все поля!");

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    setTimeout(() => {
        lastTickets = [{ origin: from, destination: to, price: 3200, link: "https://turkmenistanairlines.tm" }];
        renderTickets(lastTickets);
    }, 800);
}

function renderTickets(tickets) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    const lang = dict[currentLang];

    tickets.forEach(t => {
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-header"><span style="color:#0056b3; font-size:12px; cursor:pointer">${lang.rules}</span></div>
                <div class="ticket-route">${t.origin} <i class="fas fa-plane" style="color:#ccc; font-size:14px; margin:0 10px;"></i> ${t.destination}</div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">${lang.dep}</div><div class="t-val">17:30</div></div>
                    <div><div class="t-lbl">${lang.arr}</div><div class="t-val">22:50</div></div>
                    <div><div class="t-lbl">Status</div><div class="t-val" style="color:green">${lang.direct}</div></div>
                    <div><div class="t-lbl">${lang.time}</div><div class="t-val">03:20</div></div>
                    <div><div class="t-lbl">${lang.flight}</div><div class="t-val">T5-442</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price">${t.price} TMT</div>
                    <a href="${t.link}" target="_blank" class="buy-btn">${lang.buy}</a>
                </div>
            </div>`;
    });
}

function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

function setQuickSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}