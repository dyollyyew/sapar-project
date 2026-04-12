const TOKEN = "23a9b11bc2672f0692432adc75cfc003"; // Твой токен
const MARKER = "716446"; // Твой маркер

// Настройка календаря (строго YYYY-MM-DD)
flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" });

async function startSearch() {
    // Исправление ввода: всегда в верхний регистр
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) return alert("Пожалуйста, заполните все поля!");

    resDiv.innerHTML = "<center style='padding:50px;'>Gözlenilýär (Идет поиск)...</center>";

    // Используем мощный прокси для обхода "API Error"
    const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        const json = JSON.parse(wrapper.contents); // Извлекаем данные из прокси-обертки

        if (!json.data || json.data.length === 0) {
            resDiv.innerHTML = "<center style='padding:50px;'>Билетов не найдено. Попробуйте другую дату.</center>";
            return;
        }

        // Очищаем и рисуем билеты
        resDiv.innerHTML = "";
        json.data.slice(0, 5).forEach((f, i) => {
            // Наценка 5%
            const priceWithMarkup = Math.round(f.price * 1.05);
            
            resDiv.innerHTML += `
                <div style="background:#fff; border-radius:15px; padding:20px; margin:15px auto; max-width:800px; display:flex; justify-content:space-between; align-items:center; border:1px solid #ddd; position:relative;">
                    ${i === 0 ? '<div style="position:absolute; top:-10px; left:20px; background:#008755; color:white; padding:2px 10px; border-radius:10px; font-size:12px;">Самый дешевый</div>' : ''}
                    <div>
                        <img src="https://pics.avs.io/100/35/${f.airline}.png">
                        <div style="margin-top:10px;"><b style="font-size:18px;">${from} ✈ ${to}</b></div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:26px; font-weight:bold;">${priceWithMarkup.toLocaleString()} ₽</div>
                        <div style="font-size:11px; color:gray; margin-bottom:10px;">5% сбор включен</div>
                        <button onclick="handlePay('${f.link}')" style="background:#008755; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-weight:bold;">SATYN AL</button>
                    </div>
                </div>`;
        });
    } catch (err) {
        resDiv.innerHTML = "<center style='color:red; padding:50px;'>API Error. Проверьте токен или интернет.</center>"; //
    }
}

function handlePay(link) {
    // Проверка ЛК перед покупкой
    const user = localStorage.getItem('sap_user');
    if (!user) {
        alert("Пожалуйста, сначала заполните данные в Профиле (ЛК)!");
        if(typeof openModal === "function") openModal(); 
        return;
    }
    // Переход на Aviasales с твоим маркером
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}