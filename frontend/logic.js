const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!",
        sub: "Aşgabat — Dünýäniň gapysy",
        from: "Nireden (From)",
        to: "Nirä (To)",
        date: "Sene (Date)",
        search: "Gözleg (Search)",
        popular: "Meşhur ugurlar",
        loading: "Gözlenilýär...",
        none: "Petek tapylmady.",
        buy: "SATYN AL",
        dep: "Uçuş",
        arr: "Geliş"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!",
        sub: "Ашхабад — Врата мира",
        from: "Откуда (From)",
        to: "Куда (To)",
        date: "Дата (Date)",
        search: "Поиск (Search)",
        popular: "Популярные направления",
        loading: "Поиск билетов...",
        none: "Билетов не найдено.",
        buy: "КУПИТЬ",
        dep: "Вылет",
        arr: "Прилет"
    }
};

let currentLang = 'tk';

function changeLang(lang) {
    currentLang = lang;
    
    // Обновляем тексты на странице
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('hero-sub').innerText = dict[lang].sub;
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.getElementById('btn-search').innerText = dict[lang].search;
    document.getElementById('pop-title').innerText = `${dict[lang].popular} / Популярные направления`;
    
    // Если на экране есть результаты поиска, очищаем их (чтобы не путать языки)
    document.getElementById('results-list').innerHTML = "";
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

    if(!from || !to || !date) return alert(currentLang === 'tk' ? "Maglumatlary giriziň!" : "Заполните все поля!");

    resBox.innerHTML = `<div style="text-align:center; padding:20px; color:#008755;"><i class="fas fa-sync fa-spin"></i> ${dict[currentLang].loading}</div>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ origin: from, destination: to, date: date })
        });
        const data = await response.json();
        resBox.innerHTML = "";

        if(data.tickets && data.tickets.length > 0) {
            data.tickets.forEach(t => {
                resBox.innerHTML += `
                    <div class="ticket-item">
                        <div class="route-details">
                            <div style="text-align:center">
                                <div class="city-name">${t.origin}</div>
                                <div style="font-size:12px; color:#888">${dict[currentLang].dep}</div>
                            </div>
                            <div class="plane-path"><i class="fas fa-plane"></i></div>
                            <div style="text-align:center">
                                <div class="city-name">${t.destination}</div>
                                <div style="font-size:12px; color:#888">${dict[currentLang].arr}</div>
                            </div>
                        </div>
                        <div class="price-tag">
                            <div class="cost" style="font-size:20px; font-weight:bold;">${t.price.toLocaleString()} RUB</div>
                            <a href="https://www.aviasales.ru${t.link}" class="buy-now" target="_blank" style="background:#d32f2f; color:white; text-decoration:none; padding:10px; border-radius:5px; display:block; margin-top:10px;">${dict[currentLang].buy}</a>
                        </div>
                    </div>`;
            });
        } else {
            resBox.innerHTML = `<div style="text-align:center; padding:20px;">${dict[currentLang].none}</div>`;
        }
    } catch (e) {
        resBox.innerHTML = `<div style="text-align:center; padding:20px; color:red;">Error!</div>`;
    }
}