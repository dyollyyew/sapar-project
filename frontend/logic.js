const MARKER = "716446";
const dict = {
    tk: { 
        title: "HOŞ GELDIŇIZ!", from: "Nireden", to: "Nirä", date: "Sene", search: "GÖZLEG", 
        pop: "Meşhur ugurlar", buy: "SATYN AL", loading: "Gözlenilýär...", comm: "+5% hyzmat tölegi" 
    },
    ru: { 
        title: "ДОБРО ПОЖАЛОВАТЬ!", from: "Откуда", to: "Куда", date: "Дата", search: "ПОИСК", 
        pop: "Популярные направления", buy: "КУПИТЬ", loading: "Поиск...", comm: "+5% комиссия включена" 
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

// Инициализация календаря
const fp = flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today", defaultDate: "today" });

function getCityName(code) {
    const city = cities.find(c => c.code === code.toUpperCase());
    return city ? (currentLang === 'tk' ? city.name : city.ru) : code;
}

function toggleModal(show) {
    document.getElementById('lk-modal').style.display = show ? 'flex' : 'none';
}

function saveUser() {
    const fio = document.getElementById('u-fio').value.trim();
    const pass = document.getElementById('u-pass').value.trim();
    if (!fio || !pass) return alert("Maglumatlary dolduryň!");
    localStorage.setItem('sap_user', JSON.stringify({ fio, pass }));
    document.getElementById('user-btn').innerText = fio.split(' ')[0];
    toggleModal(false);
}

async function runSearch() {
    const from = document.getElementById('from').value.toUpperCase();
    const to = document.getElementById('to').value.toUpperCase();
    const dateStr = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !dateStr) return;

    const [d, m, y] = dateStr.split('.');
    const apiDate = `${y}-${m}-${d}`;

    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:50px;">${dict[currentLang].loading}</center>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: from, destination: to, date: apiDate })
        });
        const data = await response.json();
        renderTickets(data.tickets, from, to);
    } catch (err) {
        resBox.innerHTML = `<center style="color:red; padding:50px;">API Connection Error</center>`; //
    }
}

function renderTickets(tickets, fromCode, toCode) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    const fromName = getCityName(fromCode);
    const toName = getCityName(toCode);

    tickets.forEach(t => {
        const finalPrice = Math.round(t.price * 1.05);
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">
                    <img src="https://pics.avs.io/100/35/${t.airline}.png"> 
                    ${fromName} ✈ ${toName}
                </div>
                <div class="ticket-footer">
                    <div class="price-box">
                        <div class="price">${finalPrice.toLocaleString()} RUB</div>
                        <div class="comm-info">${dict[currentLang].comm}</div>
                    </div>
                    <button class="buy-btn" onclick="handleBuy('${t.link}')">${dict[currentLang].buy}</button>
                </div>
            </div>`;
    });
}

function handleBuy(link) {
    if (!localStorage.getItem('sap_user')) {
        alert("Bilet almak üçin Profil maglumatlaryny dolduryň!");
        toggleModal(true);
        return;
    }
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}