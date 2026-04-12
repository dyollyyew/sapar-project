const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

// Настройка календаря (формат YYYY-MM-DD обязателен для API)
flatpickr("#date", { dateFormat: "Y-m-d", defaultDate: "today" });

// 1. Управление ЛК
function openModal() { document.getElementById('lk-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('lk-modal').style.display = 'none'; }

function saveLK() {
    const user = {
        fio: document.getElementById('u-fio').value.trim(),
        email: document.getElementById('u-email').value.trim(),
        phone: document.getElementById('u-phone').value.trim(),
        passport: document.getElementById('u-pass').value.trim()
    };
    if (!user.fio || !user.passport) return alert("F.I.O. we Pasport hökmany!");
    localStorage.setItem('sap_user', JSON.stringify(user));
    document.getElementById('user-btn').innerText = user.fio.split(' ')[0];
    closeModal();
}

// 2. Поиск (С исправлением CORS и регистра)
async function startSearch() {
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) return alert("Ähli meýdançalary dolduryň!");

    resDiv.innerHTML = "<center style='margin-top:50px;'>Gözlenilýär...</center>";

    try {
        // Использование CORS Proxy для обхода ошибки "API Error"
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        
        // Сначала пробуем без прокси, если не выйдет - с ним
        let response = await fetch(apiUrl);
        
        if (!response.ok) {
            response = await fetch(proxy + apiUrl);
        }
        
        const json = await response.json();

        if (!json.data || json.data.length === 0) {
            resDiv.innerHTML = "<center style='margin-top:50px;'>Bilet tapylmady. Başga sene synanyşyň.</center>";
            return;
        }

        renderResults(json.data, from, to);
    } catch (err) {
        console.error(err);
        resDiv.innerHTML = "<center style='color:red; margin-top:50px;'>API baglanyşyk ýalňyşlygy. <br> Internetiňizi we Tokeniňizi barlaň.</center>";
    }
}

// 3. Отрисовка с наценкой 5% (Дизайн Aviasales)
function renderResults(data, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";

    data.slice(0, 5).forEach((flight, i) => {
        // Твой сбор 5%
        const finalPrice = Math.round(flight.price * 1.05);
        
        // Бейджи
        let badge = "";
        let bColor = "";
        if (i === 0) { badge = "САМЫЙ ДЕШЕВЫЙ"; bColor = "#008755"; }
        else if (i === 1) { badge = "ОПТИМАЛЬНЫЙ"; bColor = "#007bff"; }

        resDiv.innerHTML += `
            <div class="ticket" style="background:#fff; border-radius:15px; padding:20px; margin:15px auto; max-width:800px; display:flex; justify-content:space-between; border:1px solid #ddd; position:relative;">
                ${badge ? `<div style="position:absolute; top:-10px; left:20px; background:${bColor}; color:white; padding:2px 10px; border-radius:10px; font-size:12px; font-weight:bold;">${badge}</div>` : ''}
                <div style="flex:1;">
                    <img src="https://pics.avs.io/120/40/${flight.airline}.png">
                    <div style="margin-top:10px;">
                        <b style="font-size:18px;">${from} ✈ ${to}</b><br>
                        <small style="color:gray;">Reýs: ${flight.flight_number}</small>
                    </div>
                </div>
                <div style="text-align:right; border-left: 1px solid #eee; padding-left: 20px;">
                    <div style="font-size:26px; font-weight:bold;">${finalPrice.toLocaleString()} ₽</div>
                    <div style="font-size:11px; color:gray; margin-bottom:10px;">5% hyzmat tölegi bilen</div>
                    <button onclick="pay('${flight.link}')" style="background:#008755; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">SATYN AL</button>
                </div>
            </div>`;
    });
}

// 4. Логика оплаты
function pay(link) {
    const user = localStorage.getItem('sap_user');
    if (!user) {
        alert("Lütfan, profil maglumatlaryňyzy dolduryň!");
        openModal();
        return;
    }
    // Отправляем на Aviasales с твоим маркером
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}