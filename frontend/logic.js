const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

// Инициализация календаря
flatpickr("#date", { dateFormat: "Y-m-d", defaultDate: "today" });

function openModal() { document.getElementById('lk-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('lk-modal').style.display = 'none'; }

// 2. Создание ЛК и сохранение данных пассажира
function saveLK() {
    const user = {
        fio: document.getElementById('u-fio').value.trim(),
        email: document.getElementById('u-email').value.trim(),
        phone: document.getElementById('u-phone').value.trim(),
        passport: document.getElementById('u-pass').value.trim()
    };

    if (!user.fio || !user.passport) {
        alert("F.I.O. we Pasport hökmany!");
        return;
    }

    localStorage.setItem('sap_user', JSON.stringify(user));
    document.getElementById('user-btn').innerText = user.fio.split(' ')[0];
    closeModal();
}

// 1. Поиск направления
async function startSearch() {
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) return alert("Ähli meýdançalary dolduryň!");

    resDiv.innerHTML = "<center style='margin-top:50px;'>Gözlenilýär...</center>";

    try {
        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        const resp = await fetch(url);
        const json = await resp.json();

        if (!json.data || json.data.length === 0) {
            resDiv.innerHTML = "<center style='margin-top:50px;'>Bilet tapylmady.</center>";
            return;
        }

        render(json.data, from, to);
    } catch (err) {
        resDiv.innerHTML = "<center style='color:red; margin-top:50px;'>API Error. Internetiňizi barlaň.</center>";
    }
}

// 3. Добавление сбора 5% и отрисовка вариантов
function render(data, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";

    data.slice(0, 5).forEach((flight, i) => {
        // НАЦЕНКА 5%
        const finalPrice = Math.round(flight.price * 1.05);
        
        // Бейджи как на скриншоте
        let badge = "";
        let bColor = "";
        if (i === 0) { badge = "САМЫЙ ДЕШЕВЫЙ"; bColor = "#008755"; }
        else if (i === 1) { badge = "ОПТИМАЛЬНЫЙ"; bColor = "#007bff"; }

        resDiv.innerHTML += `
            <div class="ticket">
                ${badge ? `<div class="badge" style="background:${bColor}">${badge}</div>` : ''}
                <div style="flex:1;">
                    <img src="https://pics.avs.io/120/40/${flight.airline}.png" alt="logo">
                    <div style="margin-top:10px;">
                        <b>${from} ✈ ${to}</b><br>
                        <small>Reýs: ${flight.flight_number}</small>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div class="price-val">${finalPrice.toLocaleString()} ₽</div>
                    <div style="font-size:11px; color:gray; margin-bottom:10px;">5% ýygym bilen</div>
                    <button class="btn-main" onclick="goToPay('${flight.link}')">SATYN AL</button>
                </div>
            </div>`;
    });
}

// 4. Переход на оплату (Автоматически подставляет маркер)
function goToPay(link) {
    const user = localStorage.getItem('sap_user');
    
    if (!user) {
        alert("Lütfan, ilki bilen maglumatlaryňyzy (ЛК) dolduryň!");
        openModal();
        return;
    }

    // Переход на Aviasales с твоим маркером
    const checkoutUrl = `https://www.aviasales.ru${link}&marker=${MARKER}`;
    window.open(checkoutUrl, '_blank');
}

window.onload = () => {
    const saved = localStorage.getItem('sap_user');
    if (saved) {
        const u = JSON.parse(saved);
        document.getElementById('user-btn').innerText = u.fio.split(' ')[0];
    }
};