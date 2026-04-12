const TOKEN = "23a9b11bc2672f0692432adc75cfc003"; //
const MARKER = "716446"; //

// Инициализация календаря в правильном формате YYYY-MM-DD
flatpickr("#date", { dateFormat: "Y-m-d", minDate: "today" });

function openModal() { document.getElementById('lk-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('lk-modal').style.display = 'none'; }

// Сохранение ЛК (Паспортные данные)
function saveLK() {
    const user = {
        fio: document.getElementById('u-fio').value.trim(),
        passport: document.getElementById('u-pass').value.trim()
    };
    if (!user.fio || !user.passport) return alert("Please fill FIO and Passport!");
    localStorage.setItem('sap_user', JSON.stringify(user));
    document.getElementById('user-btn').innerText = user.fio.split(' ')[0];
    closeModal();
}

async function startSearch() {
    // Принудительный верхний регистр
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if (!from || !to || !date) return alert("Fill all fields!");

    resDiv.innerHTML = "<center>Searching with 5% markup calculation...</center>";

    try {
        // Использование прокси для обхода API Error (CORS)
        const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        const dataWrapper = await response.json();
        const json = JSON.parse(dataWrapper.contents);

        if (!json.data || json.data.length === 0) {
            resDiv.innerHTML = "<center>No flights found for these dates.</center>";
            return;
        }

        render(json.data, from, to);
    } catch (err) {
        resDiv.innerHTML = "<center style='color:red;'>API Connection Error. Check Token/Internet.</center>"; //
    }
}

function render(data, from, to) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = "";

    data.slice(0, 5).forEach((f, i) => {
        // Наценка 5%
        const finalPrice = Math.round(f.price * 1.05);
        
        resDiv.innerHTML += `
            <div class="ticket">
                ${i === 0 ? '<div class="badge">Cheap Flight</div>' : ''}
                <div>
                    <img src="https://pics.avs.io/100/35/${f.airline}.png"><br>
                    <b>${from} ✈ ${to}</b><br>
                    <small>Flight: ${f.flight_number}</small>
                </div>
                <div style="text-align:right;">
                    <div class="price-text">${finalPrice.toLocaleString()} ₽</div>
                    <div style="font-size:11px; color:gray;">Includes 5% fee</div>
                    <button class="btn-main" onclick="goToPay('${f.link}')" style="margin-top:10px;">BUY NOW</button>
                </div>
            </div>`;
    });
}

function goToPay(link) {
    const user = localStorage.getItem('sap_user');
    // Проверка ЛК перед оплатой
    if (!user) {
        alert("Please create Profile and fill Passport (A1904657) first!");
        openModal();
        return;
    }
    // Редирект с партнерским маркером
    window.open(`https://www.aviasales.ru${link}&marker=${MARKER}`, '_blank');
}

// Проверка ЛК при загрузке страницы
window.onload = () => {
    const saved = localStorage.getItem('sap_user');
    if (saved) {
        const u = JSON.parse(saved);
        document.getElementById('user-btn').innerText = u.fio.split(' ')[0];
    }
};