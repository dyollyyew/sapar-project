const MARKER = "716446";
const COMMISSION = 1.05;

const dict = {
    tk: { title: "HOŞ GELDIŇIZ!", search: "GÖZLEG", buy: "SATYN AL", loading: "Gözlenilýär...", error: "Bilet tapylmady" },
    ru: { title: "ДОБРО ПОЖАЛОВАТЬ!", search: "ПОИСК", buy: "КУПИТЬ", loading: "Поиск...", error: "Билеты не найдены" }
};

let currentLang = 'tk';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupSuggest('from', 'suggest-from');
    setupSuggest('to', 'suggest-to');
    
    flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" });
});

// Умные подсказки (Любой язык + Любой город)
function setupSuggest(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);
    
    input.oninput = async () => {
        const val = input.value.trim();
        if (val.length < 2) { box.style.display = 'none'; return; }

        try {
            const res = await fetch(`/api/autocomplete?term=${encodeURIComponent(val)}`);
            const data = await res.json();

            box.innerHTML = '';
            if (data.length > 0) {
                box.style.display = 'block';
                data.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggest-item';
                    div.innerHTML = `<span>${item.name}</span> <b>${item.code}</b>`;
                    div.onclick = () => {
                        input.value = `${item.name} (${item.code})`;
                        box.style.display = 'none';
                    };
                    box.appendChild(div);
                });
            }
        } catch (e) { console.error(e); }
    };
}

// Поиск
async function runSearch() {
    const fromVal = document.getElementById('from').value;
    const toVal = document.getElementById('to').value;
    const date = document.getElementById('date').value;

    if (!fromVal || !toVal || !date) return alert("Dolduryň!");

    const resBox = document.getElementById('results-list');
    resBox.innerHTML = `<div style="text-align:center;">${dict[currentLang].loading}</div>`;

    const origin = fromVal.match(/\((.*?)\)/)[1];
    const destination = toVal.match(/\((.*?)\)/)[1];

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination, date })
        });
        const data = await response.json();

        if (data.success && data.tickets.length > 0) {
            resBox.innerHTML = '';
            data.tickets.forEach(t => {
                const finalPrice = Math.round(t.price * COMMISSION);
                resBox.innerHTML += `
                    <div class="ticket-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                        <p><b>${t.origin} ✈ ${t.destination}</b></p>
                        <p>Bahasy: ${finalPrice} RUB</p>
                        <button onclick="buyTicket('${t.origin}', '${t.destination}', '${date}')" class="btn-search">
                            ${dict[currentLang].buy}
                        </button>
                    </div>`;
            });
        } else {
            resBox.innerHTML = dict[currentLang].error;
        }
    } catch (e) { resBox.innerHTML = "Server Error"; }
}

// Переход на Aviasales
function buyTicket(origin, destination, date) {
    const d = date.split('-');
    const dateFormatted = d[2] + d[1]; 
    const url = `https://www.aviasales.ru/search/${origin}${dateFormatted}${destination}1?marker=${MARKER}`;
    window.open(url, '_blank');
}