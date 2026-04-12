const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

// Инициализация календаря
flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" });

async function getFlights() {
    const from = document.getElementById('from').value.trim().toUpperCase();
    const to = document.getElementById('to').value.trim().toUpperCase();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) {
        showToast("Ähli meýdançalary dolduryň!");
        return;
    }

    // Скрываем популярные направления при поиске
    const popularSection = document.getElementById('popular');
    if (popularSection) popularSection.style.display = 'none';

    resDiv.innerHTML = `<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Gözlenilýär...</div>`;

    try {
        // Используем более стабильный эндпоинт цен
        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&unique=false&sorting=price&direct=false&currency=tmt&limit=10&token=${TOKEN}`;
        
        const response = await fetch(url);
        const json = await response.json();

        if (!json.success || !json.data || json.data.length === 0) {
            resDiv.innerHTML = `<div style="text-align:center; padding:20px;">Bilet tapylmady. Başga sene saýlap görüň.</div>`;
            return;
        }

        renderTickets(json.data, from, to);
    } catch (error) {
        console.error("API Error:", error);
        resDiv.innerHTML = `<div style="text-align:center; color:red; padding:20px;">Error API. Internetiňizi barlaň.</div>`;
    }
}

function renderTickets(flights, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";

    // Сортируем для категорий (как на фото Aviasales)
    const sortedByPrice = [...flights].sort((a, b) => a.price - b.price);

    flights.forEach((f, i) => {
        let badgeClass = "optimal";
        let badgeText = "Оптимальный";

        if (f.price === sortedByPrice[0].price) {
            badgeClass = "cheap";
            badgeText = "Самый дешевый";
        } else if (i === flights.length - 1) {
            badgeClass = "fast";
            badgeText = "Самый быстрый";
        }

        // Форматируем время из API (строка типа 2026-05-30T17:30:00Z)
        const depTime = f.departure_at ? f.departure_at.split('T')[1].substring(0, 5) : "--:--";
        
        // Логотип авиакомпании (используем сервис Aviasales для иконок)
        const logoUrl = `https://pics.avs.io/200/80/${f.airline}.png`;

        resDiv.innerHTML += `
            <div class="ticket">
                <div class="ticket-badge ${badgeClass}">${badgeText}</div>
                <div class="ticket-left">
                    <img src="${logoUrl}" alt="${f.airline}" style="height:30px; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:20px; width:100%;">
                        <div><b style="font-size:22px;">${depTime}</b><br><small>${from}</small></div>
                        <div style="flex:1; border-bottom:1px solid #ddd; position:relative;">
                            <span style="position:absolute; top:-12px; left:45%; background:#fff; padding:0 5px;">✈</span>
                        </div>
                        <div><b style="font-size:22px;">--:--</b><br><small>${to}</small></div>
                    </div>
                </div>
                <div class="ticket-right">
                    <div class="price">${Math.round(f.price)} TMT</div>
                    <button class="buy-btn" onclick="book('${f.link}')">SATYN AL</button>
                </div>
            </div>`;
    });
}

function book(link) {
    const user = JSON.parse(localStorage.getItem('sap_user') || '{}');
    if (!user.name) {
        showToast("Profil maglumatlaryňyzy dolduryň!");
        toggleLK();
        return;
    }
    // Отправляем на Aviasales с твоим маркером
    const finalUrl = `https://www.aviasales.ru${link}&marker=${MARKER}`;
    window.open(finalUrl, '_blank');
}