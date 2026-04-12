// 1. Настройка календаря (Flatpickr)
const calendar = flatpickr("#date-picker", {
    dateFormat: "d.m.Y", // Формат как на твоем скриншоте
    minDate: "today",
    "locale": "ru",      // По умолчанию русский календарь
    disableMobile: "true"
});

// 2. Словарь для перевода
const dict = {
    tk: {
        cabinet: "Giriş",
        title: "HOŞ GELDIŇIZ!",
        from: "Nireden",
        to: "Nirä",
        date: "Sene",
        search: "GÖZLEG",
        popular: "Meşhur ugurlar",
        buy: "ZABRONIROWAT",
        dep: "Uçuş", arr: "Geliş", path: "Prowoý", way: "Wagt", flight: "Reýs"
    },
    ru: {
        cabinet: "Вход",
        title: "ДОБРО ПОЖАЛОВАТЬ!",
        from: "Откуда",
        to: "Куда",
        date: "Дата",
        search: "ПОИСК",
        popular: "Популярные направления",
        buy: "ЗАБРОНИРОВАТЬ",
        dep: "Вылет", arr: "Прилет", path: "Прямой", way: "В пути", flight: "Рейс"
    }
};

let currentLang = 'tk';

// 3. База городов (для автозаполнения)
const cityList = [
    {name: "Ashgabat", code: "ASB", country: "Turkmenistan"},
    {name: "Kazan", code: "KZN", country: "Russia"},
    {name: "Moscow", code: "MOW", country: "Russia"},
    {name: "Istanbul", code: "IST", country: "Turkey"},
    {name: "Dubai", code: "DXB", country: "UAE"},
    {name: "Saint Petersburg", code: "LED", country: "Russia"}
];

// 4. Логика подсказок городов
function handleSuggest(input, boxId) {
    const box = document.getElementById(boxId);
    const query = input.value.toLowerCase();
    box.innerHTML = "";
    
    if (query.length < 1) {
        box.style.display = "none";
        return;
    }

    const filtered = cityList.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
        box.style.display = "block";
        filtered.forEach(city => {
            const div = document.createElement("div");
            div.className = "suggest-item";
            div.innerHTML = `<strong>${city.code}</strong> - ${city.name}, ${city.country}`;
            div.onclick = () => {
                input.value = city.code; // Записываем код в инпут
                box.style.display = "none";
            };
            box.appendChild(div);
        });
    } else {
        box.style.display = "none";
    }
}

// 5. Функция смены языка
function changeLang(lang) {
    currentLang = lang;
    document.getElementById('txt-cabinet').innerText = dict[lang].cabinet;
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.getElementById('btn-search').innerText = dict[lang].search;
    document.getElementById('pop-title').innerText = dict[lang].popular;
    
    // Переключаем визуальный фокус на кнопках языка
    document.getElementById('btn-tk').style.color = (lang === 'tk') ? '#008755' : '#999';
    document.getElementById('btn-ru').style.color = (lang === 'ru') ? '#008755' : '#999';
}

// 6. Быстрое заполнение при клике на карточку
function quickFill(from, to) {
    document.getElementById('from-input').value = from;
    document.getElementById('to-input').value = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 7. Поиск билетов
async function runSearch() {
    const from = document.getElementById('from-input').value;
    const to = document.getElementById('to-input').value;
    const date = document.getElementById('date-picker').value;
    const resultsArea = document.getElementById('results');

    if (!from || !to || !date) {
        alert("Maglumatlary giriziň!");
        return;
    }

    resultsArea.innerHTML = "<center>Gözlenilýär...</center>";

    try {
        // Здесь твой реальный запрос к API
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ origin: from, destination: to, date: date })
        });
        const data = await response.json();
        
        resultsArea.innerHTML = "";

        if (data.tickets && data.tickets.length > 0) {
            data.tickets.forEach(t => {
                // Создаем билет по твоему образцу
                resultsArea.innerHTML += `
                <div class="ticket">
                    <div class="ticket-top">
                        <div class="airline">Turkmenistan Airline</div>
                        <a href="#" class="rules-link">Правила тарифа и нормы багажа</a>
                    </div>
                    <div style="font-weight:bold; margin-bottom:15px">${t.origin} ✈ ${t.destination}</div>
                    <div class="ticket-body">
                        <div><div class="t-lbl">${dict[currentLang].dep}</div><div class="t-val">17:30</div></div>
                        <div><div class="t-lbl">${dict[currentLang].arr}</div><div class="t-val">22:50</div></div>
                        <div><div class="t-lbl">Пересадки</div><div style="font-weight:600">${dict[currentLang].path}</div></div>
                        <div><div class="t-lbl">${dict[currentLang].way}</div><div style="font-weight:600">03 ч 20 мин</div></div>
                        <div><div class="t-lbl">${dict[currentLang].flight}</div><div style="font-weight:600">740</div></div>
                    </div>
                    <div class="ticket-footer">
                        <div class="t-price">${t.price.toLocaleString()} RUB</div>
                        <button class="btn-buy">${dict[currentLang].buy}</button>
                    </div>
                </div>`;
            });
        } else {
            resultsArea.innerHTML = "<center>Petek tapylmady.</center>";
        }
    } catch (e) {
        resultsArea.innerHTML = "<center>Error connecting to API.</center>";
    }
}