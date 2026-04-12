const MARKER = "716446";
const COMMISSION = 1.05;

const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene",
        search: "GÖZLEG", popular: "Meşhur ugurlar", profile: "Profil", buy: "SATYN AL",
        loading: "Gözlenilýär...", saved: "Siziň maglumatlaryňyz ýazdyryldy!", modal: "Passenger Maglumatlary"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — Врата мира", from: "Откуда", to: "Куда", date: "Дата",
        search: "ПОИСК", popular: "Популярные направления", profile: "Профиль", buy: "КУПИТЬ",
        loading: "Поиск билетов...", saved: "Ваши данные успешно сохранены!", modal: "Данные пассажира"
    }
};

const cities = [
    { name: "Ashgabat", code: "ASB", ru: "Ашхабад" },
    { name: "Kazan", code: "KZN", ru: "Казань" },
    { name: "Moscow", code: "DME", ru: "Москва" },
    { name: "Istanbul", code: "IST", ru: "Стамбул" },
    { name: "Dubai", code: "DXB", ru: "Дубай" }
];

let currentLang = 'tk';

// Initialize Calendar
flatpickr("#date", { dateFormat: "d.m.Y", minDate: "today" });

// Language Switcher
function changeLang(lang) {
    currentLang = lang;
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
    
    document.getElementById('hero-title').innerText = dict[lang].title;
    document.getElementById('hero-sub').innerText = dict[lang].sub;
    document.getElementById('lbl-from').innerText = dict[lang].from;
    document.getElementById('lbl-to').innerText = dict[lang].to;
    document.getElementById('lbl-date').innerText = dict[lang].date;
    document.getElementById('btn-search').innerText = dict[lang].search;
    document.getElementById('pop-title').innerText = dict[lang].popular;
    document.getElementById('txt-profile').innerText = dict[lang].profile;
    document.getElementById('modal-title').innerText = dict[lang].modal;
}

// Autocomplete
function setupSuggest(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);
    input.oninput = () => {
        const val = input.value.toLowerCase();
        box.innerHTML = '';
        if(!val) { box.style.display = 'none'; return; }
        const filtered = cities.filter(c => c.name.toLowerCase().includes(val) || c.ru.toLowerCase().includes(val) || c.code.toLowerCase().includes(val));
        if(filtered.length > 0) {
            box.style.display = 'block';
            filtered.forEach(c => {
                const div = document.createElement('div');
                div.className = 'suggest-item';
                const fullName = currentLang === 'tk' ? c.name : c.ru;
                div.innerText = `${fullName} (${c.code})`;
                div.onclick = () => {
                    input.value = `${fullName} (${c.code})`;
                    box.style.display = 'none';
                };
                box.appendChild(div);
            });
        }
    };
}
setupSuggest('from', 'suggest-from');
setupSuggest('to', 'suggest-to');

// Profile Logic
function openProfile() {
    document.getElementById('profile-modal').style.display = 'flex';
    const saved = JSON.parse(localStorage.getItem('user_data') || '{}');
    if(saved.name) {
        document.getElementById('p-name').value = saved.name;
        document.getElementById('p-surname').value = saved.surname;
        document.getElementById('p-email').value = saved.email;
    }
}
function closeProfile() { document.getElementById('profile-modal').style.display = 'none'; }

function saveProfile() {
    const data = {
        name: document.getElementById('p-name').value,
        surname: document.getElementById('p-surname').value,
        email: document.getElementById('p-email').value
    };
    localStorage.setItem('user_data', JSON.stringify(data));
    showToast(dict[currentLang].saved);
    closeProfile();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Search & Buy Logic
function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    if(!from || !to || !date) return alert("Fill all fields!");

    const resBox = document.getElementById('results-list');
    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:40px;">${dict[currentLang].loading}</center>`;

    setTimeout(() => {
        const price = 3200;
        const finalPrice = Math.round(price * COMMISSION);
        resBox.innerHTML = `
            <div class="ticket">
                <div class="ticket-info">
                    <div><b>${from}</b><br><small>12:00</small></div>
                    <div style="color:#ccc">✈</div>
                    <div><b>${to}</b><br><small>15:30</small></div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:22px; font-weight:800; color:var(--green)">${finalPrice} TMT</div>
                    <button class="buy-btn" onclick="buyTicket('${from}', '${to}', '${date}')">${dict[currentLang].buy}</button>
                </div>
            </div>`;
    }, 1000);
}

function buyTicket(from, to, date) {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if(!user.name) {
        alert(currentLang === 'tk' ? "Profil dolduryň!" : "Заполните профиль!");
        return openProfile();
    }
    
    // Extract IATA codes from "City Name (IATA)"
    const fromCode = from.match(/\((.*?)\)/)[1];
    const toCode = to.match(/\((.*?)\)/)[1];
    const d = date.split('.').join('').substring(0,4); // Format: 1204
    
    const url = `https://www.aviasales.ru/search/${fromCode}${d}${toCode}1?marker=${MARKER}&name=${user.name}&surname=${user.surname}&email=${user.email}`;
    window.open(url, '_blank');
}

function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

function setQuickSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    runSearch();
}