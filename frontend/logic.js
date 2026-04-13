// Данные администратора
const ADMIN_PASS = "sapar2024";

document.addEventListener('DOMContentLoaded', () => {
    // Чиним календарь
    flatpickr("#date-picker", { 
        minDate: "today", 
        dateFormat: "d.m.Y",
        defaultDate: "26.04.2026" 
    });
    renderPopular();
    updateUI();
});

// 1. Популярные направления с ПОЛНЫМИ названиями
function renderPopular() {
    const dests = [
        { f: "Ashgabat (ASB)", t: "Istanbul (IST)", img: "IMG/ist.jpg" },
        { f: "Ashgabat (ASB)", t: "Moscow (DME)", img: "IMG/mow.jpg" },
        { f: "Ashgabat (ASB)", t: "Dubai (DXB)", img: "IMG/dxb.jpg" }
    ];
    const grid = document.getElementById('popular-grid');
    grid.innerHTML = dests.map(d => `
        <div class="dest-card" onclick="setSearch('${d.f}', '${d.t}')" style="cursor:pointer; border:1px solid #eee; border-radius:10px; overflow:hidden; text-align:center; background:#fff;">
            <img src="${d.img}" style="width:100%; height:150px; object-fit:cover;">
            <p style="padding:10px; font-weight:bold;">${d.f} — ${d.t}</p>
        </div>
    `).join('');
}

function setSearch(f, t) {
    document.getElementById('from').value = f;
    document.getElementById('to').value = t;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Логика ПОИСКА и ПОКУПКИ
function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date-picker').value;

    if (!from || !to) return alert("Şäherleri giriziň!");

    document.getElementById('popular-section').style.display = 'none';
    const area = document.getElementById('display-area');
    
    area.innerHTML = `
        <div class="ticket-card">
            <div style="display:flex; justify-content:space-between; color:#008755; font-weight:bold;">
                <span>Turkmenistan Airline</span>
                <span style="font-size:12px; cursor:pointer;">Nyrh kadalary</span>
            </div>
            <div style="margin:20px 0; font-size:18px; font-weight:bold;">
                ${from} ✈ ${to} <span style="font-weight:normal; color:#888;">${date}</span>
            </div>
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:20px;">
                <div style="font-size:24px; font-weight:800; color:#008755;">3360 TMT</div>
                <button onclick="buyTicket('${from}', '${to}', '${date}')" style="background:#008755; color:white; border:none; padding:12px 25px; border-radius:8px; cursor:pointer; font-weight:bold;">SATYN AL (КУПИТЬ)</button>
            </div>
        </div>
    `;
}

function buyTicket(f, t, d) {
    let tickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
    tickets.push({ route: `${f} - ${t}`, date: d, id: Date.now() });
    localStorage.setItem('myTickets', JSON.stringify(tickets));
    alert("Bilet satyn alyndy! 'Meniň biletlerim' bölüminden görüp bilersiňiz.");
}

// 3. Личный кабинет (Документы и Билеты)
function showSection(type) {
    const area = document.getElementById('display-area');
    document.getElementById('popular-section').style.display = 'none';
    
    if (type === 'docs') {
        const d = JSON.parse(localStorage.getItem('userDocs') || '{"fio":"","pass":"","tel":"","mail":""}');
        area.innerHTML = `
            <div class="docs-form" style="background:white; padding:20px; border-radius:15px; border:1px solid #ddd;">
                <h3>Meniň resminamalarym</h3>
                <input type="text" id="doc-fio" placeholder="F.I.A. (ФИО)" value="${d.fio}">
                <input type="text" id="doc-pass" placeholder="Pasport maglumatlary" value="${d.pass}">
                <input type="text" id="doc-tel" placeholder="Telefon" value="${d.tel}">
                <input type="email" id="doc-mail" placeholder="E-mail" value="${d.mail}">
                <button onclick="saveDocs()" style="background:#008755; color:white; border:none; padding:10px 20px; width:100%; border-radius:8px; cursor:pointer;">ÝATDA SAKLA</button>
            </div>
        `;
    } else if (type === 'tickets') {
        const tks = JSON.parse(localStorage.getItem('myTickets') || '[]');
        area.innerHTML = '<h3>Meniň biletlerim</h3>' + (tks.length ? tks.map(t => `
            <div style="background:white; padding:15px; border-bottom:1px solid #eee; margin-bottom:5px;">
                <b>${t.route}</b> <br> <small>${t.date}</small>
            </div>
        `).join('') : '<p>Bilet ýok.</p>');
    }
}

function saveDocs() {
    const data = {
        fio: document.getElementById('doc-fio').value,
        pass: document.getElementById('doc-pass').value,
        tel: document.getElementById('doc-tel').value,
        mail: document.getElementById('doc-mail').value
    };
    localStorage.setItem('userDocs', JSON.stringify(data));
    alert("Maglumatlar ýatda saklandy!");
}

// 4. Защита АДМИНКИ и ВХОД
function handleLogin() {
    const pass = prompt("Admin parolyňyzy giriziň:");
    if (pass === ADMIN_PASS) {
        localStorage.setItem('role', 'admin');
        updateUI();
        alert("Hoş geldiňiz, Admin!");
    } else {
        alert("Ýalňyş parol!");
    }
}

function openAdminPanel() {
    if (localStorage.getItem('role') === 'admin') {
        window.location.href = 'admin.html'; //
    } else {
        alert("Giriş gadagan!");
    }
}

function updateUI() {
    const role = localStorage.getItem('role');
    const adminMenu = document.getElementById('admin-menu-item');
    if (role === 'admin') {
        adminMenu.style.display = 'block';
        document.getElementById('profile-text').innerText = "Admin";
    }
}

function logout() {
    localStorage.removeItem('role');
    location.reload();
}

function toggleMenu() {
    const m = document.getElementById('dropdown-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function swapCities() {
    const f = document.getElementById('from');
    const t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}
// Имитация базы данных рейсов
const flightsData = [
    { from: "Ashgabat (ASB)", to: "Istanbul (IST)", time: "10:00", price: "4500 TMT" },
    { from: "Ashgabat (ASB)", to: "Moscow (DME)", time: "14:30", price: "3800 TMT" }
];

function startSearch() {
    const fromVal = document.getElementById('from').value;
    const toVal = document.getElementById('to').value;
    const resultsDiv = document.getElementById('results-container');
    const listDiv = document.getElementById('flights-list');

    if (!fromVal || !toVal) {
        showMsg("Dolduryň!"); //
        return;
    }

    showMsg('Gözlenýär...'); //
    
    // Очищаем старые результаты
    listDiv.innerHTML = '';
    
    // Фильтруем данные
    const found = flightsData.filter(f => f.from === fromVal && f.to === toVal);

    if (found.length > 0) {
        resultsDiv.style.display = 'block';
        found.forEach(flight => {
            listDiv.innerHTML += `
                <div style="background:white; padding:20px; border-radius:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div>
                        <strong style="font-size:18px;">${flight.from} ✈ ${flight.to}</strong><br>
                        <span style="color:#666;">Wagt: ${flight.time}</span>
                    </div>
                    <div style="text-align:right;">
                        <span style="color:var(--main-green); font-weight:bold; font-size:20px;">${flight.price}</span><br>
                        <button class="btn-search" style="padding:8px 15px; font-size:14px; margin-top:5px;">Satyn al</button>
                    </div>
                </div>
            `;
        });
    } else {
        showMsg("Reýs tapylmady"); //
        resultsDiv.style.display = 'none';
    }
}
async function findTickets() {
    const fromVal = document.getElementById('from').value.toUpperCase(); //
    const toVal = document.getElementById('to').value.toUpperCase(); //
    const list = document.getElementById('ticket-list');

    showToast("Gözleg başlandy..."); //

    try {
        // Здесь указывается адрес твоего API
        const response = await fetch(`https://api.sapar.tm/flights?from=${fromVal}&to=${toVal}`);
        const found = await response.json();

        list.innerHTML = "";
        
        if (found.length > 0) {
            document.getElementById('results-container').style.display = 'block';
            found.forEach(f => {
                list.innerHTML += `
                    <div class="ticket">
                        <div>
                            <strong>${f.from} ✈ ${f.to}</strong><br>
                            <small>${f.company}</small>
                        </div>
                        <div style="text-align:right;">
                            <div class="price">${f.price} TMT</div>
                            <button class="btn-go">Satyn al</button>
                        </div>
                    </div>`;
            });
        } else {
            showToast("Reýs tapylmady.");
        }
    } catch (error) {
        console.error("API Error:", error);
        showToast("Сервер недоступен"); //
    }
}