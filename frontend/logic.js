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
    
    if(!from || !to || !date) return alert("Dolduryň!");

    const resBox = document.getElementById('results-list');
    document.getElementById('popular-section').style.display = 'none';
    resBox.innerHTML = `<div style="text-align:center; padding:30px;">Gözlenilýär...</div>`;

    setTimeout(() => {
        // Вырезаем код аэропорта из скобок (например, ASB)
        const fromCode = from.match(/\((.*?)\)/) ? from.match(/\((.*?)\)/)[1] : "BKN";
        const toCode = to.match(/\((.*?)\)/) ? to.match(/\((.*?)\)/)[1] : "ASB";

        resBox.innerHTML = `
        <div style="background:#fff; border-radius:6px; padding:20px; margin:20px auto; max-width:850px; box-shadow:0 2px 8px rgba(0,0,0,0.1); border:1px solid #ddd; font-family: Arial, sans-serif;">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <span style="color:#008755; font-weight:bold;">Turkmenistan Airline</span>
                <span style="color:#008755; cursor:pointer; font-size:13px; border-bottom:1px dashed #008755;">Правила тарифа</span>
            </div>
            
            <div style="font-size:18px; font-weight:bold; margin-bottom:15px;">
                ${fromCode} <span style="color:#008755;">✈</span> ${toCode} 
                <span style="font-weight:normal; font-size:14px; margin-left:10px;">Вылет ${date}</span>
            </div>

            <div style="display:grid; grid-template-columns: repeat(5, 1fr); border-top:1px solid #eee; border-bottom:1px solid #eee; padding:10px 0; margin-bottom:20px;">
                <div><small style="color:#888;">Вылет</small><br><b>11:55</b></div>
                <div><small style="color:#888;">Прилет</small><br><b>12:45</b></div>
                <div><small style="color:#888;">Пересадки</small><br><span>Прямой</span></div>
                <div><small style="color:#888;">В пути</small><br><span>00 ч 50 м</span></div>
                <div><small style="color:#888;">Рейс</small><br><span>254</span></div>
            </div>

            <div style="display:flex; justify-content:flex-end; align-items:center; gap:20px;">
                <div style="font-size:22px; font-weight:bold; color:#008755;">3360 TMT</div>
                <button onclick="buyTicket('${from}', '${to}', '${date}')" 
                    style="background:#008755; color:white; border:none; padding:10px 25px; border-radius:4px; font-weight:bold; cursor:pointer; text-transform:uppercase;">
                    Забронировать
                </button>
            </div>
        </div>`;
    }, 600);
}

async function findTickets() {
    console.log("Функция поиска вызвана!"); // Для проверки в консоли
    // ... твой код функции ...
}

// Привязываем напрямую к ID для надежности
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('main-search-btn');
    if(btn) {
        btn.onclick = findTickets;
    }
});
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
function fill(fromCity, toCity) {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    
    if (fromInput && toInput) {
        fromInput.value = fromCity;
        toInput.value = toCity;
        
       window.onload = function() {
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.onclick = findTickets;
        console.log("Кнопка поиска успешно активирована");
    } else {
        console.error("Кнопка с классом .btn-search не найдена в HTML!");
    }
};
        
        showMsg("Ugur saýlandy!"); // Показываем уведомление
    }
}
