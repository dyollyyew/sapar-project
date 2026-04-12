const TOKEN = "23a9b11bc2672f0692432adc75cfc003"; //
const MARKER = "716446"; //

// Настройка календаря
flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" }); //

async function startSearch() {
    // 1. Фикс регистра: kzn -> KZN
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) return alert("Заполните все поля!");

    resDiv.innerHTML = "<center style='padding:40px;'>Gözlenilýär...</center>";

    // 2. Ссылка на API
    const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
    
    // Используем прокси AllOrigins (он самый стабильный для Vercel)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Proxy error');
        
        const wrapper = await response.json();
        const json = JSON.parse(wrapper.contents); // Декодируем данные из прокси

        if (!json.data || json.data.length === 0) {
            resDiv.innerHTML = "<center style='padding:40px;'>Билетов не найдено на эту дату.</center>";
            return;
        }

        renderTickets(json.data, from, to);
    } catch (err) {
        console.error(err);
        resDiv.innerHTML = `<center style='color:red; padding:40px;'>API Connection Error. <br> Проверьте токен или интернет.</center>`; //
    }
}

function renderTickets(data, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";

    data.slice(0, 5).forEach((f, i) => {
        // 3. Твой сбор 5%
        const finalPrice = Math.round(f.price * 1.05);
        
        resDiv.innerHTML += `
            <div style="background:#fff; border-radius:12px; padding:20px; margin:15px auto; max-width:800px; display:flex; justify-content:space-between; align-items:center; border:1px solid #ddd; position:relative;">
                ${i === 0 ? '<div style="position:absolute; top:-10px; left:20px; background:#008755; color:white; padding:2px 10px; border-radius:10px; font-size:12px;">САМЫЙ ДЕШЕВЫЙ</div>' : ''}
                <div>
                    <img src="https://pics.avs.io/100/35/${f.airline}.png"><br>
                    <b style="font-size:18px;">${from} ✈ ${to}</b>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:24px; font-weight:bold;">${finalPrice.toLocaleString()} ₽</div>
                    <div style="font-size:11px; color:gray; margin-bottom:8px;">+5% сбор включен</div>
                    <button onclick="checkAndPay('${f.link}')" style="background:#008755; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">ОПЛАТИТЬ</button>
                </div>
            </div>`;
    });
}

function checkAndPay(link) {
    // 4. Проверка ЛК и паспортных данных (A1904657) перед оплатой
    const user = localStorage.getItem('sap_user');
    if (!user) {
        alert("Сначала создайте ЛК и заполните данные паспорта!");
        openModal(); // Функция открытия твоей модалки
        return;
    }
    // Автоматический переход с твоим маркером
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}