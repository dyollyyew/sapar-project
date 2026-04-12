// 1. База городов
const cities = [
    { name: "Ашхабад", code: "ASB" },
    { name: "Казань", code: "KZN" },
    { name: "Москва", code: "MOW" },
    { name: "Стамбул", code: "IST" },
    { name: "Дубай", code: "DXB" }
];

// 2. Переключение языков
const translations = {
    rus: {
        welcome: "ДОБРО ПОЖАЛОВАТЬ!",
        login: "Войти",
        search: "ПОИСК",
        from: "Откуда",
        to: "Куда",
        date: "Дата",
        popular: "Популярные направления",
        notFound: "Билеты не найдены."
    },
    tkm: {
        welcome: "HOŞ GELDIŇIZ!",
        login: "Giriş",
        search: "GÖZLEG",
        from: "Nireden",
        to: "Nirä",
        date: "Sene",
        popular: "Meşhur ugurlar",
        notFound: "Petek tapylmady."
    }
};

let currentLang = 'rus';

function changeLang(lang) {
    currentLang = lang;
    document.getElementById('lang-rus').classList.toggle('active', lang === 'rus');
    document.getElementById('lang-tkm').classList.toggle('active', lang === 'tkm');
    
    document.getElementById('txt-welcome').innerText = translations[lang].welcome;
    document.getElementById('txt-login').innerText = translations[lang].login;
    document.getElementById('btn-search').innerText = translations[lang].search;
    document.getElementById('lbl-from').innerText = translations[lang].from;
    document.getElementById('lbl-to').innerText = translations[lang].to;
    document.getElementById('lbl-date').innerText = translations[lang].date;
    document.getElementById('txt-popular').innerText = translations[lang].popular;
}

// 3. Календарь
flatpickr("#dateInput", {
    locale: "ru",
    dateFormat: "d.m.Y",
    minDate: "today",
    monthSelectorType: "dropdown"
});

// 4. Автозаполнение
function setupAuto(id, listId) {
    const input = document.getElementById(id);
    const list = document.getElementById(listId);

    input.oninput = () => {
        const val = input.value.toLowerCase();
        list.innerHTML = "";
        if(!val) { list.style.display = "none"; return; }
        
        const filtered = cities.filter(c => c.name.toLowerCase().includes(val) || c.code.toLowerCase().includes(val));
        if(filtered.length > 0) {
            list.style.display = "block";
            filtered.forEach(c => {
                const div = document.createElement("div");
                div.className = "city-opt";
                div.innerHTML = `<b>${c.name}</b> <span style="color:#888">(${c.code})</span>`;
                div.onclick = () => {
                    input.value = `${c.name} (${c.code})`;
                    list.style.display = "none";
                };
                list.appendChild(div);
            });
        }
    };
}
setupAuto("fromCity", "listFrom");
setupAuto("toCity", "listTo");

// 5. Реверс
function swapCities() {
    const f = document.getElementById("fromCity");
    const t = document.getElementById("toCity");
    [f.value, t.value] = [t.value, f.value];
}

// 6. Поиск (Твой идеальный билет)
function findFlight() {
    const res = document.getElementById("resultsArea");
    const from = document.getElementById("fromCity").value;
    const to = document.getElementById("toCity").value;

    if(!from || !to) return alert("Выберите города!");

    document.getElementById("popular-section").style.display = "none";
    res.innerHTML = "<center style='margin-top:40px;'><i class='fas fa-spinner fa-spin fa-2x'></i></center>";

    setTimeout(() => {
        // Убрали Turkmenistan Airlines, оставили только чистую инфу
        res.innerHTML = `
            <div class="ticket">
                <div class="ticket-top">
                    <span class="rules-link">Правила тарифа и нормы багажа</span>
                </div>
                <div class="ticket-route">
                    ${from} <i class="fas fa-plane" style="font-size:14px; color:#ccc;"></i> ${to}
                </div>
                <div class="ticket-info">
                    <div><div class="t-lbl">Вылет</div><div class="t-val">17:30</div></div>
                    <div><div class="t-lbl">Прилет</div><div class="t-val">22:50</div></div>
                    <div><div class="t-lbl">Пересадки</div><div class="t-val direct">Прямой</div></div>
                    <div><div class="t-lbl">В пути</div><div class="t-val">03 ч 20 мин</div></div>
                    <div><div class="t-lbl">Рейс</div><div class="t-val">740</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price">31 988 ₽</div>
                    <button class="btn-book">ЗАБРОНИРОВАТЬ</button>
                </div>
            </div>
        `;
    }, 600);
}