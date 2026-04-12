const MARKER = "716446";
const dict = {
    tk: { title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene", search: "GÖZLEG", loading: "Gözlenilýär...", buy: "SATYN AL", flight: "Reýs", comm: "+5% hyzmat tölegi" },
    ru: { title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира", from: "Откуда", to: "Куда", date: "Дата", search: "ПОИСК", loading: "Поиск...", buy: "КУПИТЬ", flight: "Рейс", comm: "+5% комиссия включена" }
};

let currentLang = 'tk';
const fp = flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today", defaultDate: "today" });

async function runSearch() {
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const dateStr = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !dateStr) return alert("Error!");

    // Конвертация даты для бэкенда (DD.MM.YYYY -> YYYY-MM-DD)
    const parts = dateStr.split('.');
    const apiDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;">${dict[currentLang].loading}</center>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: from, destination: to, date: apiDate })
        });

        const data = await response.json();
        renderTickets(data.tickets || [], from, to, dateStr);
    } catch (err) {
        resBox.innerHTML = "<center style='color:red; padding:50px;'>Server Error</center>";
    }
}

function renderTickets(tickets, from, to, dateStr) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    if (tickets.length === 0) { resBox.innerHTML = "<center>No tickets found</center>"; return; }

    tickets.forEach(t => {
        const finalPrice = Math.round(t.price * 1.05); // Твоя наценка 5%
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">
                    <img src="https://pics.avs.io/100/35/${t.airline}.png"> ${from} ✈ ${to}
                </div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">${dict[currentLang].flight}</div><div class="t-val">${t.flight_number}</div></div>
                    <div><div class="t-lbl">${dict[currentLang].date}</div><div class="t-val">${dateStr}</div></div>
                    <div><div class="t-lbl">Status</div><div class="t-val" style="color:green">Direct</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price-box">
                        <div class="price">${finalPrice.toLocaleString()} RUB</div>
                        <div class="comm-info">${dict[currentLang].comm}</div>
                    </div>
                    <button class="buy-btn" onclick="window.open('https://www.aviasales.ru${t.link}&marker=${MARKER}', '_blank')">
                        ${dict[currentLang].buy}
                    </button>
                </div>
            </div>`;
    });
}

function changeLang(lang) {
    currentLang = lang;
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('btn-search').innerText = dict[lang].search;
    // ... остальные элементы
}