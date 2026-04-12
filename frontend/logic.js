const translations = {
    rus: {
        welcome: "ДОБРО ПОЖАЛОВАТЬ!", login: "Войти", search: "ПОИСК",
        from: "Откуда", to: "Куда", date: "Дата", popular: "Популярные направления",
        rules: "Правила тарифа", depart: "Вылет", arrive: "Прилет", 
        trans: "Пересадки", duration: "В пути", flight: "Рейс", 
        direct: "Прямой", book: "ЗАБРОНИРОВАТЬ", success: "Вы переходите к бронированию!"
    },
    tkm: {
        welcome: "HOŞ GELDIŇIZ!", login: "Giriş", search: "GÖZLEG",
        from: "Nireden", to: "Nirä", date: "Sene", popular: "Meşhur ugurlar",
        rules: "Tarif düzgünleri", depart: "Uçuş", arrive: "Geliş", 
        trans: "Garaşmaly", duration: "Ýolda", flight: "Reýs", 
        direct: "Gönümel", book: "PETEK SATYN AL", success: "Siz petek satyn almaga geçýärsiňiz!"
    }
};

let currentLang = 'tkm';
let lastSearch = null; // Храним данные последнего поиска для перевода билета

function changeLang(lang) {
    currentLang = lang;
    document.getElementById('lang-rus').classList.toggle('active', lang === 'rus');
    document.getElementById('lang-tkm').classList.toggle('active', lang === 'tkm');
    
    document.getElementById('txt-welcome').innerText = translations[lang].welcome;
    document.getElementById('txt-login').innerText = translations[lang].login;
    document.getElementById('btn-search').innerText = translations[lang].search;
    document.getElementById('lbl-from').innerText = translations[lang].from;
    document.getElementById('lbl-to').innerText = translations[lang].to;
    document.getElementById('lbl-date').innerText = translations[lang].date;
    document.getElementById('txt-popular').innerText = translations[lang].popular;

    // Если билет уже на экране, перерисовываем его
    if (lastSearch) renderTicket(lastSearch.from, lastSearch.to);
}

function swapCities() {
    const f = document.getElementById("fromCity");
    const t = document.getElementById("toCity");
    [f.value, t.value] = [t.value, f.value];
}

flatpickr("#dateInput", { dateFormat: "d.m.Y", minDate: "today" });

function findFlight() {
    const from = document.getElementById("fromCity").value || "Aşgabat";
    const to = document.getElementById("toCity").value || "Stambul";
    
    lastSearch = { from, to }; // Сохраняем для смены языка
    document.getElementById("popular-section").style.display = "none";
    renderTicket(from, to);
}

function renderTicket(from, to) {
    const res = document.getElementById("resultsArea");
    const t = translations[currentLang];
    
    res.innerHTML = `
        <div class="ticket">
            <div class="ticket-header">
                <span style="color:#0056b3; font-size:12px; cursor:pointer">${t.rules}</span>
            </div>
            <div class="ticket-route">${from} <i class="fas fa-long-arrow-alt-right" style="color:#ddd"></i> ${to}</div>
            <div class="ticket-grid">
                <div><div class="t-lbl">${t.depart}</div><div class="t-val">17:30</div></div>
                <div><div class="t-lbl">${t.arrive}</div><div class="t-val">22:50</div></div>
                <div><div class="t-lbl">${t.trans}</div><div class="t-val" style="color:green">${t.direct}</div></div>
                <div><div class="t-lbl">${t.duration}</div><div class="t-val">03:20</div></div>
                <div><div class="t-lbl">${t.flight}</div><div class="t-val">T5-442</div></div>
            </div>
            <div class="ticket-footer">
                <div class="price">3200 TMT</div>
                <button class="btn-book" onclick="bookNow()">${t.book}</button>
            </div>
        </div>
    `;
}

function bookNow() {
    alert(translations[currentLang].success);
}