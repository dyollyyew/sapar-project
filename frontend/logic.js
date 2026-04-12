const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!",
        sub: "Aşgabat — Dünýäniň gapysy",
        from: "Nireden",
        to: "Nirä",
        date: "Sene",
        search: "GÖZLEG",
        popular: "Meşhur ugurlar",
        cabinet: "Giriş", // Поменял на Giriş
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
        cabinet: "Вход", // Поменял на Вход
        buy: "КУПИТЬ",
        dep: "Вылет",
        arr: "Прилет",
        loading: "Поиск билетов..."
    }
};

let currentLang = 'tk';

// Функция смены языка
function changeLang(lang) {
    currentLang = lang;
    
    // Переключаем активный класс на кнопках
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');

    // Обновляем все текстовые поля по ID
    if(document.getElementById('hero-title')) document.getElementById('hero-title').innerText = dict[lang].title;
    if(document.getElementById('hero-sub')) document.getElementById('hero-sub').innerText = dict[lang].sub;
    if(document.getElementById('lbl-from')) document.getElementById('lbl-from').innerText = dict[lang].from;
    if(document.getElementById('lbl-to')) document.getElementById('lbl-to').innerText = dict[lang].to;
    if(document.getElementById('lbl-date')) document.getElementById('lbl-date').innerText = dict[lang].date;
    if(document.getElementById('btn-search')) document.getElementById('btn-search').innerText = dict[lang].search;
    if(document.getElementById('pop-title')) document.getElementById('pop-title').innerText = dict[lang].popular;
    if(document.getElementById('txt-cabinet')) document.getElementById('txt-cabinet').innerText = dict[lang].cabinet;
}

// Быстрый поиск при клике на карточку
function setQuickSearch(from, to) {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    
    if(fromInput && toInput) {
        fromInput.value = from;
        toInput.value = to;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log(`Quick search set: ${from} to ${to}`);
    }
}

// Главная функция поиска
async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) {
        alert(currentLang === 'tk' ? "Ähli öýjükleri dolduryň!" : "Заполните все поля!");
        return;
    }

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
                                <div style="font-size: 10px; color:#aaa;">SAPAR AIRLINES</div>
                                <div class="line"></div>
                                <div style="font-size: 10px; color:#aaa;">DIRECT</div>
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
            resBox.innerHTML = `<center style="padding:40px;">${currentLang === 'tk' ? "Petek tapylmady" : "Билетов не найдено"}</center>`;
        }
    } catch (e) {
        console.error(e);
        resBox.innerHTML = "<center style='color:red; padding:40px;'>Server Error</center>";
    }
}