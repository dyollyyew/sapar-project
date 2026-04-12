const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

const dict = {
    tk: { from: "Nireden", to: "Nirä", date: "Sene", search: "GÖZLEG", popular: "Meşhur ugurlar", lk: "Profil maglumatlary", saved: "Ýazdyryldy!" },
    ru: { from: "Откуда", to: "Куда", date: "Дата", search: "ПОИСК", popular: "Популярные направления", lk: "Данные профиля", saved: "Сохранено!" }
};

let currentLang = 'tk';
flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" });

function changeLang(lang) {
    currentLang = lang;
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.getElementById('pop-title').innerText = dict[lang].popular;
    document.getElementById('lk-title').innerText = dict[lang].lk;
}

function toggleLK() {
    const m = document.getElementById('modal');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function saveUser() {
    const user = {
        name: document.getElementById('u-name').value,
        surname: document.getElementById('u-surname').value,
        email: document.getElementById('u-email').value
    };
    localStorage.setItem('sap_user', JSON.stringify(user));
    document.getElementById('user-name-display').innerText = user.name || "Profil";
    showToast(dict[currentLang].saved);
    toggleLK();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

async function getFlights() {
    const from = document.getElementById('from').value.toUpperCase();
    const to = document.getElementById('to').value.toUpperCase();
    const date = document.getElementById('date').value;
    const res = document.getElementById('results');

    if(!from || !to || !date) return alert("Dolduryň!");

    document.getElementById('popular').style.display = 'none';
    res.innerHTML = "<center>Gözlenilýär...</center>";

    try {
        // Запрос к реальному API Aviasales
        const url = `https://api.travelpayouts.com/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=tmt&token=${TOKEN}`;
        const response = await fetch(url);
        const data = await response.json();

        if(!data.data || data.data.length === 0) {
            res.innerHTML = "<center>Билеты не найдены.</center>";
            return;
        }

        render(data.data, from, to);
    } catch (e) {
        res.innerHTML = "<center>Error API.</center>";
    }
}

function render(data, from, to) {
    const res = document.getElementById('results');
    res.innerHTML = "";
    
    // Сортируем для меток (самый дешевый и т.д.)
    const sorted = [...data].sort((a,b) => a.price - b.price);

    data.slice(0, 5).forEach((f, i) => {
        let badgeClass = "optimal";
        let badgeText = "Оптимальный";
        
        if(f.price === sorted[0].price) { badgeClass = "cheap"; badgeText = "Самый дешевый"; }
        if(i === 2) { badgeClass = "fast"; badgeText = "Самый быстрый"; }

        const priceWithComm = Math.round(f.price * 1.05);

        res.innerHTML += `
            <div class="ticket">
                <div class="ticket-badge ${badgeClass}">${badgeText}</div>
                <div class="ticket-left">
                    <div><b style="font-size:20px;">${from}</b><br><small>${f.departure_at.split('T')[0]}</small></div>
                    <div style="color:#ddd">✈</div>
                    <div><b style="font-size:20px;">${to}</b><br><small>Reýs: ${f.flight_number}</small></div>
                </div>
                <div class="ticket-right">
                    <div class="price">${priceWithComm} TMT</div>
                    <button class="buy-btn" onclick="book('${f.link}')">SATYN AL</button>
                </div>
            </div>`;
    });
}

function book(link) {
    const user = JSON.parse(localStorage.getItem('sap_user') || '{}');
    if(!user.name) {
        alert("Profil dolduryň!");
        toggleLK();
        return;
    }
    // Формируем финальную ссылку с твоим маркером
    const final = `https://www.aviasales.ru${link}&marker=${MARKER}&name=${user.name}`;
    window.open(final, '_blank');
}

function swap() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

function quick(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
}