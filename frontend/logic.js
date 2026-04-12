const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!",
        sub: "Aşgabat — Dünýäniň gapysy",
        from: "Nireden",
        to: "Nirä",
        date: "Sene",
        search: "GÖZLEG",
        popular: "Meşhur ugurlar",
        cabinet: "Hasabym",
        buy: "SATYN AL",
        dep: "Uçuş",
        arr: "Geliş",
        loading: "Gözlenilýär..."
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!",
        sub: "Ашхабад — Врата мира",
        from: "Откуда",
        to: "Куда",
        date: "Дата",
        search: "ПОИСК",
        popular: "Популярные направления",
        cabinet: "Кабинет",
        buy: "КУПИТЬ",
        dep: "Вылет",
        arr: "Прилет",
        loading: "Поиск билетов..."
    }
};

let currentLang = 'tk';

function changeLang(lang) {
    currentLang = lang;
    
    // Активные кнопки
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');

    // Тексты
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('hero-sub').innerText = dict[lang].sub;
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.getElementById('btn-search').innerText = dict[lang].search;
    document.getElementById('pop-title').innerText = dict[lang].popular;
    document.getElementById('txt-cabinet').innerText = dict[lang].cabinet;
}

function setQuickSearch(from, to) {
    document.getElementById('from').value = from;
    document.getElementById('to').value = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) return alert("Error!");

    resBox.innerHTML = `<div class="loader"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</div>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ origin: from.toUpperCase(), destination: to.toUpperCase(), date: date })
        });
        const data = await response.json();
        resBox.innerHTML = "";

        if(data.tickets && data.tickets.length > 0) {
            data.tickets.forEach(t => {
                resBox.innerHTML += `
                    <div class="ticket">
                        <div class="ticket-left">
                            <div class="city-block">
                                <h2>${t.origin}</h2>
                                <p>${dict[currentLang].dep}</p>
                            </div>
                            <div class="flight-info">
                                <div style="font-size: 11px; color:#aaa; margin-bottom:5px;">SAPAR AIRLINES</div>
                                <div class="line"></div>
                                <div style="font-size: 11px; color:#aaa; margin-top:5px;">Direct Flight</div>
                            </div>
                            <div class="city-block" style="text-align: right;">
                                <h2>${t.destination}</h2>
                                <p>${dict[currentLang].arr}</p>
                            </div>
                        </div>
                        <div class="ticket-right">
                            <div class="price">${t.price.toLocaleString()} RUB</div>
                            <a href="https://www.aviasales.ru${t.link}" target="_blank" class="buy-btn">${dict[currentLang].buy}</a>
                        </div>
                    </div>`;
            });
        } else {
            resBox.innerHTML = "<center>No tickets found</center>";
        }
    } catch (e) {
        resBox.innerHTML = "<center style='color:red'>Server Error</center>";
    }
    // Инициализация красивого календаря
flatpickr("#date", {
    dateFormat: "Y-m-d",
    minDate: "today",
    "locale": "ru" // Можно менять динамически
});

const dict = {
    tk: { cabinet: "Giriş", search: "GÖZLEG", popular: "Meşhur ugurlar", buy: "Bronlamak" },
    ru: { cabinet: "Вход", search: "ПОИСК", popular: "Популярные направления", buy: "ЗАБРОНИРОВАТЬ" }
};

// Список городов для подсказок (можно тянуть с API)
const cities = [
    {name: "Ashgabat", code: "ASB", full: "Aşgabat (ASB)"},
    {name: "Istanbul", code: "IST", full: "Stambul (IST)"},
    {name: "Moscow", code: "DME", full: "Moskwa (DME)"},
    {name: "Kazan", code: "KZN", full: "Kazan (KZN)"},
    {name: "Dubai", code: "DXB", full: "Dubaý (DXB)"}
];

function showSuggest(input, listId) {
    const list = document.getElementById(listId);
    const val = input.value.toLowerCase();
    list.innerHTML = "";
    if(!val) return;

    const filtered = cities.filter(c => c.name.toLowerCase().includes(val) || c.code.toLowerCase().includes(val));
    filtered.forEach(c => {
        const div = document.createElement('div');
        div.className = 'suggest-item';
        div.innerText = c.full;
        div.onclick = () => {
            input.value = c.code;
            list.innerHTML = "";
        };
        list.appendChild(div);
    });
}

}