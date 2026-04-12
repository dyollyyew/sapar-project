const TOKEN = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

const langData = {
    tk: { btn: "GÖZLEG", login: "Giriş", ph: "Adyňyz", empty: "Ähli meýdançalary dolduryň!", error: "Bilet tapylmady" },
    ru: { btn: "ПОИСК", login: "Вход", ph: "Ваше имя", empty: "Заполните все поля!", error: "Билеты не найдены" }
};

let currentLang = 'tk';

// Настройка даты
flatpickr("#date", { dateFormat: "Y-m-d", defaultDate: "today" });

// Перевод
function changeLang(l) {
    currentLang = l;
    document.getElementById('btn-tk').className = l === 'tk' ? 'active' : '';
    document.getElementById('btn-ru').className = l === 'ru' ? 'active' : '';
    document.getElementById('search-text').innerText = langData[l].btn;
    document.getElementById('user-label').innerText = langData[l].login;
    document.getElementById('user-input').placeholder = langData[l].ph;
}

// Профиль
function openProfile() { document.getElementById('modal-profile').style.display = 'flex'; }
function saveUser() {
    const name = document.getElementById('user-input').value;
    if(name) {
        localStorage.setItem('user', name);
        document.getElementById('user-label').innerText = name;
        document.getElementById('modal-profile').style.display = 'none';
    }
}

// Поиск
async function findFlights() {
    const from = document.getElementById('from').value.toUpperCase().trim();
    const to = document.getElementById('to').value.toUpperCase().trim();
    const date = document.getElementById('date').value;
    const resDiv = document.getElementById('results');

    if(!from || !to || !date) {
        alert(langData[currentLang].empty);
        return;
    }

    document.getElementById('popular-box').style.display = 'none';
    resDiv.innerHTML = "<center>Gözlenilýär...</center>";

    try {
        // Запрос цен в РУБЛЯХ (RUB)
        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${from}&destination=${to}&departure_at=${date}&currency=rub&token=${TOKEN}`;
        const response = await fetch(url);
        const json = await response.json();

        if(!json.data || json.data.length === 0) {
            resDiv.innerHTML = `<center>${langData[currentLang].error}</center>`;
            return;
        }

        resDiv.innerHTML = "";
        json.data.slice(0, 5).forEach((f, i) => {
            let tag = i === 0 ? "Самый дешевый" : (i === 1 ? "Оптимальный" : "");
            resDiv.innerHTML += `
                <div class="ticket">
                    <div>
                        <img src="https://pics.avs.io/100/40/${f.airline}.png"><br>
                        <b>${from} ✈ ${to}</b><br>
                        <small>Reýs: ${f.flight_number}</small>
                    </div>
                    <div style="text-align:right">
                        <h2 style="margin:0">${f.price.toLocaleString()} ₽</h2>
                        <button class="btn-go" onclick="window.open('https://www.aviasales.ru${f.link}&marker=${MARKER}')">SATYN AL</button>
                    </div>
                </div>`;
        });
    } catch (e) {
        resDiv.innerHTML = "<center style='color:red'>API Error. Token barlap görüň!</center>";
    }
}

function quickSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    findFlights();
}

function swap() {
    let f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

window.onload = () => {
    const n = localStorage.getItem('user');
    if(n) document.getElementById('user-label').innerText = n;
};