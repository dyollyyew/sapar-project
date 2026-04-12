// 1. База городов (полные названия)
const cityList = [
    { name: "Ашхабад", code: "ASB", country: "Туркменистан" },
    { name: "Казань", code: "KZN", country: "Россия" },
    { name: "Москва", code: "MOW", country: "Россия" },
    { name: "Стамбул", code: "IST", country: "Турция" },
    { name: "Дубай", code: "DXB", country: "ОАЭ" }
];

// 2. Красивый календарь (Flatpickr)
// Добавили dropdown для месяцев и годов, чтобы было удобно
flatpickr("#datePicker", {
    locale: "ru",
    dateFormat: "d.m.Y",
    minDate: "today",
    monthSelectorType: "dropdown", // Месяцы списком
    yearSelectorType: "dropdown",  // Годы списком
    disableMobile: "true"
});

// 3. Логика автозаполнения (Autocomplete)
function initAutocomplete(inputId, dropId) {
    const input = document.getElementById(inputId);
    const drop = document.getElementById(dropId);

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        drop.innerHTML = '';
        if (val.length < 1) { drop.style.display = 'none'; return; }

        const filtered = cityList.filter(c => 
            c.name.toLowerCase().includes(val) || c.code.toLowerCase().includes(val)
        );

        if (filtered.length > 0) {
            drop.style.display = 'block';
            filtered.forEach(city => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                // Теперь пишем название полностью + код
                item.innerHTML = `<b>${city.name}</b> <small style="color:#888">(${city.code})</small>`;
                item.onclick = () => {
                    input.value = `${city.name} (${city.code})`; // Полное название в инпут
                    drop.style.display = 'none';
                };
                drop.appendChild(item);
            });
        } else {
            drop.style.display = 'none';
        }
    });
}

initAutocomplete('fromInput', 'fromDrop');
initAutocomplete('toInput', 'toDrop');

// 4. Функция обратного направления (SWAP)
function swapValues() {
    const from = document.getElementById('fromInput');
    const to = document.getElementById('toInput');
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
}

// 5. Поиск билетов
function searchAction() {
    const results = document.getElementById('resultsArea');
    const from = document.getElementById('fromInput').value;
    const to = document.getElementById('toInput').value;
    const date = document.getElementById('datePicker').value;

    if (!from || !to || !date) {
        alert("Пожалуйста, заполните все данные!");
        return;
    }

    results.innerHTML = "<center style='padding:50px;'>Gözlenilýär...</center>";

    // Имитация поиска рейсов
    setTimeout(() => {
        // Мы "находим" рейс, если это популярные направления
        const found = (from.includes("ASB") || from.includes("KZN") || from.includes("MOW"));

        if (found) {
            results.innerHTML = `
            <div class="ticket">
                <div class="ticket-header">
                    <div style="color:#008755; font-weight:bold;">Turkmenistan Airline</div>
                    <div style="font-size:12px; color:blue; cursor:pointer;">Правила тарифа и нормы багажа</div>
                </div>
                <div style="font-weight:bold; margin-bottom:15px;">${from} ✈ ${to}</div>
                <div class="ticket-grid">
                    <div><div class="t-lbl">Вылет</div><div class="t-val">17:30</div></div>
                    <div><div class="t-lbl">Прилет</div><div class="t-val">22:50</div></div>
                    <div><div class="t-lbl">Пересадки</div><div class="t-val" style="color:green">Прямой</div></div>
                    <div><div class="t-lbl">В пути</div><div class="t-val">03 ч 20 мин</div></div>
                    <div><div class="t-lbl">Рейс</div><div class="t-val">740</div></div>
                </div>
                <div class="ticket-footer">
                    <div class="price">31 988 ₽</div>
                    <button class="btn-buy">ЗАБРОНИРОВАТЬ</button>
                </div>
            </div>`;
        } else {
            // Если рейс не найден
            results.innerHTML = "<center style='padding:50px; font-size:18px; color:#666;'>Petek tapylmady.</center>";
        }
    }, 800);
}