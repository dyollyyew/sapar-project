const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

// Авто-настройка календаря (только формат YYYY-MM-DD!)
flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" });

async function startSearch() {
    // 1. Принудительно делаем буквы БОЛЬШИМИ (чтобы не было Error API)
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) {
        alert("Ähli meýdançalary dolduryň!"); 
        return;
    }

    resDiv.innerHTML = "<center style='padding:50px;'>Gözlenilýär (Идет поиск)...</center>";

    try {
        // 2. Используем прокси для обхода блокировок браузера (CORS)
        const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(apiUrl);
        
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        const json = JSON.parse(wrapper.contents); // Получаем чистые данные из прокси

        if (!json.data || json.data.length === 0) {
            resDiv.innerHTML = "<center style='padding:50px;'>Bilet tapylmady. Başga sene synanyşyň.</center>";
            return;
        }

        renderTickets(json.data, from, to);
    } catch (err) {
        console.error(err);
        resDiv.innerHTML = "<center style='color:red; padding:50px;'>API baglanyşyk ýalňyşlygy. <br> Internetiňizi we Tokeniňizi barlaň.</center>";
    }
}

function renderTickets(data, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";

    data.slice(0, 5).forEach((flight, i) => {
        // 3. ДОБАВЛЯЕМ ТВОИ 5% СБОРА
        const finalPrice = Math.round(flight.price * 1.05);
        
        // Оформление как на твоем образце
        let badge = "";
        let bColor = "";
        if (i === 0) { badge = "Самый дешевый"; bColor = "#008755"; }
        else if (i === 1) { badge = "Оптимальный"; bColor = "#007bff"; }

        resDiv.innerHTML += `
            <div style="background:#fff; border-radius:15px; padding:20px; margin:15px auto; max-width:800px; display:flex; justify-content:space-between; border:1px solid #ddd; position:relative;">
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

function pay(link) {
    const user = localStorage.getItem('sap_user');
    if (!user) {
        alert("Lütfan, profil maglumatlaryňyzy dolduryň (Сначала заполните ЛК)!");
        openModal(); // Открываем твою модалку для паспорта
        return;
    }
    // Открываем авиакомпанию с твоим маркером
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}