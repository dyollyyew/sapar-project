// Словарик для перевода
const dictionary = {
    tk: { profile: "Profil", title: "HOŞ GELDIŇIZ!", sub: "Aşgabat — Dünýäniň gapysy", search: "GÖZLEG", book: "SATYN AL", direct: "Göni" },
    ru: { profile: "Профиль", title: "ДОБРО ПОЖАЛОВАТЬ!", sub: "Ашхабад — ворота мира", search: "ПОИСК", book: "ЗАБРОНИРОВАТЬ", direct: "Прямой" }
};

let currentLang = 'tk';

// Инициализация календаря
flatpickr("#date", { minDate: "today", dateFormat: "d.m.Y" });

// Смена языка (дизайн 83d50f)
function changeLang(lang) {
    currentLang = lang;
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
    
    document.getElementById('txt-profile').innerText = dictionary[lang].profile;
    document.getElementById('hero-title').innerText = dictionary[lang].title;
    document.getElementById('hero-sub').innerText = dictionary[lang].sub;
    document.getElementById('btn-search').innerText = dictionary[lang].search;
}

// Управление меню ЛК (дизайн 836908)
function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// Модальное окно (дизайн 83680c)
function openProfileModal() {
    document.getElementById('modal-profile').style.display = 'flex';
    toggleMenu();
}

function closeProfileModal() {
    document.getElementById('modal-profile').style.display = 'none';
}

function saveData() {
    const name = document.getElementById('inp-name').value;
    alert("Maglumatlar ýatda saklandy: " + name);
    closeProfileModal();
}

// Поиск и отрисовка билета (дизайн 835585)
function runSearch() {
    const from = document.getElementById('from').value || "ASB";
    const to = document.getElementById('to').value || "KZN";
    const date = document.getElementById('date').value || "26.04.2026";
    const results = document.getElementById('results-list');

    results.innerHTML = `
        <div class="ticket-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <b style="color:var(--green)">Turkmenistan Airline</b>
                <span style="color:var(--green); font-size:12px; cursor:pointer">Nyrh kadalary</span>
            </div>
            <div style="font-weight:bold; font-size:17px; margin-bottom:15px;">
                ${from} <i class="fas fa-plane" style="font-size:13px; color:var(--green); margin:0 8px;"></i> ${to}
                <span style="font-weight:normal; color:#888; font-size:14px; margin-left:15px;">Uçuş: ${date}</span>
            </div>
            <div class="ticket-grid">
                <div><small style="color:#999">Uçuş</small><br><b>11:55</b></div>
                <div><small style="color:#999">Gonuş</small><br><b>12:45</b></div>
                <div><small style="color:#999">Gatnaw</small><br><span>${dictionary[currentLang].direct}</span></div>
                <div><small style="color:#999">Wagt</small><br><span>00 s 50 m</span></div>
                <div><small style="color:#999">Reýs</small><br><span>254</span></div>
            </div>
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:25px;">
                <div style="font-size:24px; font-weight:800; color:var(--green);">3360 TMT</div>
                <button class="btn-search" style="height:45px; border-radius:8px;">${dictionary[currentLang].book}</button>
            </div>
        </div>
    `;
}

// Закрытие при клике мимо
window.onclick = function(e) {
    if (!e.target.closest('.profile-wrapper')) {
        document.getElementById('dropdown-menu').style.display = 'none';
    }
}