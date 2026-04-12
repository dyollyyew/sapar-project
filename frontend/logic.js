const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!",
        sub: "Aşgabat — Dünýäniň gapysy",
        from: "Nireden",
        to: "Nirä",
        date: "Sene",
        search: "GÖZLEG",
        popular: "Meşhur ugurlar",
        cabinet: "Giriş",
        buy: "SATYN AL",
        dep: "Uçuş",
        arr: "Geliş",
        loading: "Gözlenilýär...",
        direct: "Gönümel",
        duration: "Ýolda",
        flight: "Reýs",
        rules: "Tarif düzgünleri"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!",
        sub: "Ашхабад — Врата мира",
        from: "Откуда",
        to: "Куда",
        date: "Дата",
        search: "ПОИСК",
        popular: "Популярные направления",
        cabinet: "Вход",
        buy: "КУПИТЬ",
        dep: "Вылет",
        arr: "Прилет",
        loading: "Поиск билетов...",
        direct: "Прямой",
        duration: "В пути",
        flight: "Рейс",
        rules: "Правила тарифа"
    }
};

let currentLang = 'tk';
let searchResults = [];

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

    if (searchResults.length > 0) renderTickets(searchResults);
}

function swapCities() {
    const f = document.getElementById('from');
    const t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today" });

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

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${dict[currentLang].loading}</center>`;

    try {
        // Имитация API запроса
        setTimeout(() => {
            searchResults = [
                { origin: from, destination: to, price: 3200, timeDep: "17:30", timeArr: "22:50", flight: "T5-442" }
            ];
            renderTickets(searchResults);
        }, 800);
    } catch (e) {
        resBox.innerHTML = "Error!";
    }
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
                    <button class="btn-buy" onclick="alert('OK')">${lang.buy}</button>
                </div>
            </div>`;
    });
}