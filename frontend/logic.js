// Поиск полного названия города по коду (KZN -> Казань)
function getCityName(code) {
    const city = cities.find(c => c.code === code.toUpperCase());
    if (!city) return code; // Если не нашли, вернем просто код
    return currentLang === 'tk' ? city.name : city.ru;
}

// Функции для Личного Кабинета
function toggleModal(show) {
    document.getElementById('lk-modal').style.display = show ? 'flex' : 'none';
}

function saveUser() {
    const fio = document.getElementById('u-fio').value.trim();
    const pass = document.getElementById('u-pass').value.trim();
    const email = document.getElementById('u-email').value.trim();

    if (!fio || !pass) return alert("Adyňyzy we pasportyňyzy ýazyň!");

    const userData = { fio, pass, email };
    localStorage.setItem('sap_user', JSON.stringify(userData)); // Сохраняем как в image_74c9a5.jpg
    
    // Обновляем текст кнопки Профиля
    document.getElementById('user-btn').innerText = fio.split(' ')[0]; 
    toggleModal(false);
}

// При загрузке страницы проверяем ЛК
window.addEventListener('load', () => {
    const saved = localStorage.getItem('sap_user');
    if (saved) {
        const u = JSON.parse(saved);
        document.getElementById('user-btn').innerText = u.fio.split(' ')[0];
    }
});

// Обновленная функция отрисовки билета (с полными именами)
function renderTickets(tickets, fromCode, toCode, dateStr) {
    const resBox = document.getElementById('results-list');
    resBox.innerHTML = "";
    
    // Получаем полные названия городов
    const fromName = getCityName(fromCode);
    const toName = getCityName(toCode);

    tickets.forEach(t => {
        const finalPrice = Math.round(t.price * 1.05);
        resBox.innerHTML += `
            <div class="ticket">
                <div class="ticket-route">
                    <img src="https://pics.avs.io/100/35/${t.airline}.png"> 
                    <span title="${fromCode}">${fromName}</span> 
                    <i class="fas fa-plane" style="color:#ccc; margin:0 10px;"></i> 
                    <span title="${toCode}">${toName}</span>
                </div>
                <div class="ticket-footer">
                    <div class="price-box">
                        <div class="price">${finalPrice.toLocaleString()} RUB</div>
                        <div class="comm-info">${dict[currentLang].comm}</div>
                    </div>
                    <button class="buy-btn" onclick="handlePurchase('${t.link}')">
                        ${dict[currentLang].buy}
                    </button>
                </div>
            </div>`;
    });
}

function handlePurchase(link) {
    const user = localStorage.getItem('sap_user');
    if (!user) {
        alert("Bilet satyn almak üçin ilki bilen Profilde maglumatlary dolduryň!");
        toggleModal(true); // Открываем ЛК, если данных нет
        return;
    }
    // Если данные есть, переходим на оплату
    window.open(`https://www.aviasales.ru${link}&marker=716446`, '_blank');
}