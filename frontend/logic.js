const MARKER = "716446";
const COMMISSION = 1.05;

const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", from: "Nireden", to: "Nirä", date: "Sene",
        search: "GÖZLEG", popular: "Meşhur ugurlar", profile: "Profil", buy: "SATYN AL",
        loading: "Gözlenilýär...", saved: "Siziň maglumatlaryňyz ýazdyryldy!", modal: "Yolagçy Profili"
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
flatpickr("#date", { 
    dateFormat: "d.m.Y", 
    minDate: "today",
    disableMobile: "true"
});

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

// Autocomplete Logic
function setupSuggest(inputId, suggestId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestId);
    
    input.oninput = () => {
        const val = input.value.toLowerCase();
        box.innerHTML = '';
        if(!val || val.length < 1) { box.style.display = 'none'; return; }
        
        const filtered = cities.filter(c => 
            c.name.toLowerCase().includes(val) || 
            c.ru.toLowerCase().includes(val) || 
            c.code.toLowerCase().includes(val)
        );

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
        } else {
            box.style.display = 'none';
        }
    };
    
    // Скрывать подсказки при клике вне поля
    document.addEventListener('click', (e) => {
        if (e.target !== input) box.style.display = 'none';
    });
}
setupSuggest('from', 'suggest-from');
setupSuggest('to', 'suggest-to');

// Profile Management
function openProfile() {
    document.getElementById('profile-modal').style.display = 'flex';
    const saved = JSON.parse(localStorage.getItem('user_data') || '{}');
    if(saved.name) {
        document.getElementById('p-name').value = saved.name || "";
        document.getElementById('p-surname').value = saved.surname || "";
        document.getElementById('p-email').value = saved.email || "";
    }
}

function closeProfile() { document.getElementById('profile-modal').style.display = 'none'; }

function saveProfile() {
    const data = {
        name: document.getElementById('p-name').value,
        surname: document.getElementById('p-surname').value,
        email: document.getElementById('p-email').value
    };
    if(!data.name || !data.surname) return alert("Dolduryň!");
    
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

// Search & Redirection Logic
function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    
    if(!from || !to || !date) {
        alert(currentLang === 'tk' ? "Hemme öýjükleri dolduryň!" : "Заполните все поля!");
        return;
    }

    const resBox = document.getElementById('results-list');
    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<center style="padding:40px; font-weight:bold; color:var(--green);">${dict[currentLang].loading}</center>`;

    setTimeout(() => {
        const basePrice = 3200;
        const finalPrice = Math.round(basePrice * COMMISSION);
        resBox.innerHTML = `
            <div class="ticket">
                <div class="ticket-info">
                    <div><b>${from.split('(')[0]}</b><br><small>12:00</small></div>
                    <div style="color:var(--green); font-size:20px;">✈</div>
                    <div><b>${to.split('(')[0]}</b><br><small>15:30</small></div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:22px; font-weight:800; color:var(--green)">${finalPrice} TMT</div>
                    <button class="buy-btn" onclick="buyTicket('${from}', '${to}', '${date}')">${dict[currentLang].buy}</button>
                </div>
            </div>`;
    }, 800);
}

function buyTicket(from, to, date) {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    if(!user.name) {
        alert(currentLang === 'tk' ? "Dowam etmek üçin profil dolduryň!" : "Для продолжения заполните профиль!");
        return openProfile();
    }
    
    try {
        const fromCode = from.match(/\((.*?)\)/)[1];
        const toCode = to.match(/\((.*?)\)/)[1];
        // Формат для Aviasales: DDMM (например, 1304 для 13 апреля)
        const parts = date.split('.');
        const dmm = parts[0] + parts[1]; 
        
        const url = `https://www.aviasales.ru/search/${fromCode}${dmm}${toCode}1?marker=${MARKER}`;
        window.open(url, '_blank');
    } catch (e) {
        alert("Error in city codes. Please use suggestions.");
    }
}

function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    const temp = f.value;
    f.value = t.value;
    t.value = temp;
}

function setQuickSearch(fCode, tCode) {
    const cityF = cities.find(c => c.code === fCode);
    const cityT = cities.find(c => c.code === tCode);
    
    const nameF = currentLang === 'tk' ? cityF.name : cityF.ru;
    const nameT = currentLang === 'tk' ? cityT.name : cityT.ru;
    
    document.getElementById('from').value = `${nameF} (${fCode})`;
    document.getElementById('to').value = `${nameT} (${tCode})`;
    
    // Устанавливаем завтрашнюю дату для быстрого поиска, если пусто
    if(!document.getElementById('date').value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const d = String(tomorrow.getDate()).padStart(2, '0');
        const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const y = tomorrow.getFullYear();
        document.getElementById('date').value = `${d}.${m}.${y}`;
    }
    
    runSearch();
}