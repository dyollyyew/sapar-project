const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy",
        from: "Nireden", to: "Nirä", date: "Sene", search: "GÖZLEG",
        popular: "Meşhur ugurlar", cabinet: "Giriş", buy: "SATYN AL",
        dep: "Uçuş", arr: "Geliş", loading: "Gözlenilýär...",
        direct: "Gönümel", duration: "Ýolda", flight: "Reýs", rules: "Tarif düzgünleri"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира",
        from: "Откуда", to: "Куда", date: "Дата", search: "ПОИСК",
        popular: "Популярные направления", cabinet: "Вход", buy: "КУПИТЬ",
        dep: "Вылет", arr: "Прилет", loading: "Поиск билетов...",
        direct: "Прямой", duration: "В пути", flight: "Рейс", rules: "Правила тарифа"
    }
};

// Список городов для подсказок
const cities = [
    { name: "Ashgabat", code: "ASB", ru: "Ашхабад" },
    { name: "Kazan", code: "KZN", ru: "Казань" },
    { name: "Moscow", code: "DME", ru: "Москва" },
    { name: "Istanbul", code: "IST", ru: "Стамбул" },
    { name: "Dubai", code: "DXB", ru: "Дубай" },
    { name: "Frankfurt", code: "FRA", ru: "Франкфурт" }
];

let currentLang = 'tk';

// --- Логика автозаполнения ---
function setupAutocomplete(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const suggestBox = document.getElementById(suggestId);

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        suggestBox.innerHTML = '';
        if (!val) { suggestBox.style.display = 'none'; return; }

        const filtered = cities.filter(c => 
            c.name.toLowerCase().includes(val) || 
            c.ru.toLowerCase().includes(val) || 
            c.code.toLowerCase().includes(val)
        );

        if (filtered.length > 0) {
            suggestBox.style.display = 'block';
            filtered.forEach(city => {
                const div = document.createElement('div');
                div.className = 'suggest-item';
                const displayName = currentLang === 'tk' ? city.name : city.ru;
                div.innerText = `${displayName} (${city.code})`;
                div.onclick = () => {
                    input.value = `${displayName} (${city.code})`;
                    suggestBox.style.display = 'none';
                };
                suggestBox.appendChild(div);
            });
        } else {
            suggestBox.style.display = 'none';
        }
    });

    // Скрывать при клике вне
    document.addEventListener('click', (e) => {
        if (e.target !== input) suggestBox.style.display = 'none';
    });
}

setupAutocomplete('from', 'suggest-from');
setupAutocomplete('to', 'suggest-to');

// --- Смена языка ---
function changeLang(lang) {
    currentLang = lang;
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
    // ... (остальные переводы из твоего словаря)
}

// --- Поиск и отрисовка ---
async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) return alert("Error! Заполните все поля.");

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    setTimeout(() => {
        const results = [
            { origin: from, destination: to, price: 3200, timeDep: "17:30", timeArr: "22:50", flight: "T5-442" }
        ];
        renderTickets(results);
    }, 800);
}

function renderTickets(tickets) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    const lang = dict[currentLang];

    tickets.forEach(t => {
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-header">
                    <span style="color:#0056b3; font-size:12px; cursor:pointer">${lang.rules}</span>
                </div>
                <div class="ticket-route">${t.origin} ✈ ${t.destination}</div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">${lang.dep}</div><div class="t-val">${t.timeDep}</div></div>
                    <div><div class="t-lbl">${lang.arr}</div><div class="t-val">${t.timeArr}</div></div>
                    <div><div class="t-lbl">Пересадки</div><div class="t-val" style="color:green">${lang.direct}</div></div>
                    <div><div class="t-lbl">${lang.duration}</div><div class="t-val">03:20</div></div>
                    <div><div class="t-lbl">${lang.flight}</div><div class="t-val">${t.flight}</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price">${t.price} TMT</div>
                    <button class="btn-buy" onclick="goToOfficialSite()">
                        ${lang.buy}
                    </button>
                </div>
            </div>`;
    });
}

function goToOfficialSite() {
    // Ссылка на официальный сайт (например, Turkmenistan Airlines)
    const officialUrl = "https://turkmenistanairlines.tm/tickets";
    window.open(officialUrl, '_blank');
}

function swapCities() {
    const f = document.getElementById('from');
    const t = document.getElementById('to');
    const temp = f.value;
    f.value = t.value;
    t.value = temp;
}