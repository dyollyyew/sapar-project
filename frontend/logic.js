const dict = {
    tk: {
        buy: "SATYN AL",
        loading: "Gözlenilýär...",
        commission_txt: "Gulluk tölegi goşuldy (5%)"
    },
    ru: {
        buy: "КУПИТЬ",
        loading: "Поиск билетов...",
        commission_txt: "Включая комиссию сервиса (5%)"
    }
};

let currentLang = 'tk';
let lastTickets = [];

// Данные "авторизованного" пассажира (для примера)
const currentUser = {
    firstName: "Sapar",
    lastName: "Saparow",
    passport: "1234567"
};

async function runSearch() {
    // ... твой код поиска (из прошлых шагов) ...
    // Допустим, API вернул базовую цену 3200
    const basePrice = 3200;
    const finalPrice = Math.round(basePrice * 1.05); // Добавляем 5%

    lastTickets = [{
        id: "FLIGHT-123",
        origin: "ASB",
        destination: "KZN",
        basePrice: basePrice,
        totalPrice: finalPrice, // Цена с комиссией
        link: "https://turkmenistanairlines.tm" // Ссылка от партнера
    }];
    renderTickets(lastTickets);
}

function renderTickets(tickets) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    const lang = dict[currentLang];

    tickets.forEach(t => {
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">${t.origin} ✈ ${t.destination}</div>
                <div class="ticket-grid">
                    </div>
                <div class="ticket-footer">
                    <div style="text-align: right; margin-right: 20px;">
                        <div class="price">${t.totalPrice} TMT</div>
                        <small style="font-size: 10px; color: #888;">${lang.commission_txt}</small>
                    </div>
                    <button class="buy-btn" onclick="processPurchase('${t.id}', ${t.totalPrice})">
                        ${lang.buy}
                    </button>
                </div>
            </div>`;
    });
}

// ГЛАВНАЯ ФУНКЦИЯ: Покупка через API с данными пассажира
async function processPurchase(flightId, finalAmount) {
    const lang = dict[currentLang];
    
    // Формируем объект для отправки на твой API
    const orderData = {
        flight_id: flightId,
        amount: finalAmount,
        passenger: currentUser, // Передаем данные пассажира
        currency: "TMT",
        timestamp: new Date().toISOString()
    };

    console.log("Отправка данных на API для оплаты:", orderData);

    try {
        // Здесь твой реальный API ключ и эндпоинт оплаты
        /*
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        window.location.href = data.payment_url; // Переход на оплату
        */

        // Для теста просто имитируем переход
        alert(currentLang === 'tk' ? "Töleg bellenilýär..." : "Формирование счета на оплату...");
        window.open(`https://turkmenistanairlines.tm/pay?amount=${finalAmount}`, '_blank');

    } catch (e) {
        console.error("Payment Error:", e);
    }
}

// Функция для логотипа (возврат на главную)
document.querySelector('.logo').onclick = (e) => {
    e.preventDefault();
    window.location.reload(); // Или window.location.href = 'index.html';
};