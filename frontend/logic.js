// База данных городов (можно расширять)
const cities = [
    { name: "Ашхабад", code: "ASB", country: "Туркменистан" },
    { name: "Казань", code: "KZN", country: "Россия" },
    { name: "Москва", code: "MOW", country: "Россия" },
    { name: "Стамбул", code: "IST", country: "Турция" },
    { name: "Дубай", code: "DXB", country: "ОАЭ" }
];

// 1. Настройка красивого календаря
flatpickr("#dateInput", {
    "locale": "ru",
    dateFormat: "d.m.Y",
    minDate: "today",
    disableMobile: true,
    // Делаем выбор месяца и года выпадающим списком
    monthSelectorType: "static", 
    onReady: function(selectedDates, dateStr, instance) {
        // Дополнительная настройка для красоты
    }
});

// 2. Функция автозаполнения (Autocomplete)
function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    input.oninput = () => {
        const val = input.value.toLowerCase();
        list.innerHTML = "";
        if (!val) { list.style.display = "none"; return; }

        const filtered = cities.filter(c => 
            c.name.toLowerCase().includes(val) || c.code.toLowerCase().includes(val)
        );

        if (filtered.length > 0) {
            list.style.display = "block";
            filtered.forEach(city => {
                const item = document.createElement("div");
                item.className = "city-item";
                // Показываем польностью название и код
                item.innerHTML = `<b>${city.name}</b> <span style="color:#888">(${city.code})</span>`;
                item.onclick = () => {
                    input.value = `${city.name} (${city.code})`; // Записываем полностью
                    list.style.display = "none";
                    input.dataset.code = city.code; // Сохраняем код для API
                };
                list.appendChild(item);
            });
        } else {
            list.style.display = "none";
        }
    };
}

// Инициализируем подсказки для обоих полей
setupAutocomplete("fromCity", "listFrom");
setupAutocomplete("toCity", "listTo");

// 3. Функция реверса (меняем города местами)
function swapCities() {
    const from = document.getElementById("fromCity");
    const to = document.getElementById("toCity");
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
}

// 4. Поиск билетов
async function findTickets() {
    const results = document.getElementById("resultsArea");
    const from = document.getElementById("fromCity").value;
    const to = document.getElementById("toCity").value;
    const date = document.getElementById("dateInput").value;

    if (!from || !to || !date) {
        alert("Пожалуйста, заполните все поля!");
        return;
    }

    results.innerHTML = "<center style='margin-top:50px;'><i class='fas fa-spinner fa-spin fa-2x'></i><br>Ищем лучшие рейсы...</center>";

    try {
        // Имитация запроса к API (замени на свой fetch)
        setTimeout(() => {
            // Если города не Kazan или Ashgabat, выводим "не найдено"
            if (!from.includes("ASB") && !from.includes("KZN")) {
                results.innerHTML = "<div style='text-align:center; padding:50px; font-size:18px; color:#666;'>Petek tapylmady. (Билетов не найдено)</div>";
                return;
            }

            // Иначе рисуем красивый билет по твоему образцу
            results.innerHTML = `
                <div class="ticket-card">
                    <div class="ticket-header">
                        <div>Turkmenistan Airline</div>
                        <div style="font-size:12px; cursor:pointer">Правила тарифа и нормы багажа</div>
                    </div>
                    <div style="font-weight:bold; margin-bottom:15px; font-size:16px;">${from} ✈ ${to}</div>
                    <div class="ticket-info">
                        <div><div class="lbl">Вылет</div><div class="val">17:30</div></div>
                        <div><div class="lbl">Прилет</div><div class="val">22:50</div></div>
                        <div><div class="lbl">Пересадки</div><div class="val" style="color:green">Прямой</div></div>
                        <div><div class="lbl">В пути</div><div class="val">03 ч 20 мин</div></div>
                        <div><div class="lbl">Рейс</div><div class="val">740</div></div>
                    </div>
                    <div class="ticket-footer">
                        <div class="price">31 988 ₽</div>
                        <button class="btn-book">ЗАБРОНИРОВАТЬ</button>
                    </div>
                </div>
            `;
        }, 1000);
    } catch (e) {
        results.innerHTML = "Ошибка сервера.";
    }
}