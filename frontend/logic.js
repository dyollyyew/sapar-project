const langData = {
    tk: { profile: "Profil", title: "HOŞ GELDIŇIZ!", search: "GÖZLEG", book: "SATYN AL", direct: "Göni" },
    ru: { profile: "Профиль", title: "ДОБРО ПОЖАЛОВАТЬ!", search: "ПОИСК", book: "КУПИТЬ", direct: "Прямой" }
};

let currentLang = 'tk';

// Календарь
flatpickr("#date", { minDate: "today", dateFormat: "d.m.Y" });

function changeLang(lang) {
    currentLang = lang;
    document.getElementById('btn-tk').classList.toggle('active', lang === 'tk');
    document.getElementById('btn-ru').classList.toggle('active', lang === 'ru');
    document.getElementById('txt-profile').innerText = langData[lang].profile;
    document.getElementById('hero-title').innerText = langData[lang].title;
    document.getElementById('btn-search').innerText = langData[lang].search;
}

function toggleMenu() {
    const m = document.getElementById('dropdown-menu');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}

function runSearch() {
    const from = document.getElementById('from').value || "ASB";
    const to = document.getElementById('to').value || "KZN";
    const date = document.getElementById('date').value || "Şu gün";

    document.getElementById('results-list').innerHTML = `
        <div class="ticket-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <b style="color:var(--green)">Turkmenistan Airline</b>
                <span style="color:var(--green); font-size:12px; cursor:pointer">Nyrh kadalary</span>
            </div>
            <div style="font-weight:bold; font-size:16px;">
                ${from} <i class="fas fa-plane" style="font-size:12px; color:var(--green); margin:0 5px;"></i> ${to}
                <span style="font-weight:normal; color:#888; font-size:14px; margin-left:10px;">${date}</span>
            </div>
            <div class="ticket-grid">
                <div><small style="color:#999">Uçuş</small><br><b>11:55</b></div>
                <div><small style="color:#999">Gonuş</small><br><b>12:45</b></div>
                <div><small style="color:#999">Gatnaw</small><br><span>${langData[currentLang].direct}</span></div>
                <div><small style="color:#999">Wagt</small><br><span>00 s 50 m</span></div>
                <div><small style="color:#999">Reýs</small><br><span>254</span></div>
            </div>
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:20px;">
                <div class="price">3360 TMT</div>
                <button class="btn-search" style="height:40px">${langData[currentLang].book}</button>
            </div>
        </div>
    `;
}

// Закрыть меню при клике в другом месте
window.onclick = function(e) {
    if (!e.target.closest('.profile-wrapper')) {
        document.getElementById('dropdown-menu').style.display = 'none';
    }
}