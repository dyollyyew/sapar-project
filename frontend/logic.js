// Словарь переводов
const dict = {
    tk: {
        title: "HOŞ GELDIŇIZ!",
        sub: "Aşgabat — Dünýäniň gapysy",
        from: "Nireden",
        to: "Nirä",
        date: "Sene",
        search: "Gözleg",
        loading: "Gözlenilýär...",
        none: "Petek tapylmady.",
        error: "Baglanyşykda näsazlyk.",
        buy: "SATYN AL",
        dep: "Uçuş",
        arr: "Geliş",
        fill: "Maglumatlary giriziň!"
    },
    ru: {
        title: "ДОБРО ПОЖАЛОВАТЬ!",
        sub: "Ашхабад — Врата мира",
        from: "Откуда",
        to: "Куда",
        date: "Дата",
        search: "Поиск",
        loading: "Поиск билетов...",
        none: "Билетов не найдено.",
        error: "Ошибка соединения.",
        buy: "КУПИТЬ",
        dep: "Вылет",
        arr: "Прилет",
        fill: "Заполните все поля!"
    }
};

let currentLang = 'tk';

// 1. Смена языка
function changeLang(lang) {
    currentLang = lang;
    document.querySelector('.hero-banner h1').innerText = dict[lang].title;
    document.querySelector('.hero-banner p').innerText = dict[lang].sub;
    document.querySelector('.input-field:nth-child(1) label').innerText = `${dict[lang].from} (From)`;
    document.querySelector('.input-field:nth-child(2) label').innerText = `${dict[lang].to} (To)`;
    document.querySelector('.input-field:nth-child(3) label').innerText = `${dict[lang].date} (Date)`;
    document.querySelector('.search-btn').innerText = `${dict[lang].search} (Search)`;
}

// 2. Инициализация (дата по умолчанию)
document.addEventListener('DOMContentLoaded', () => {
    const d = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = d;
        dateInput.min = d;
    }
});

// 3. Основная функция поиска
async function runSearch() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resBox = document.getElementById('results-list');

    if(!from || !to || !date) return alert(dict[currentLang].fill);

    resBox.innerHTML = `<div class="loader-box"><i class="fas fa-sync fa-spin"></i> ${dict[currentLang].loading}</div>`;

    try {
        const response = await fetch('/api/search-live', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ origin: from, destination: to, date: date })
        });
        const data = await response.json();
        resBox.innerHTML = "";

        if(data.tickets && data.tickets.length > 0) {
            data.tickets.forEach(t => {
                resBox.innerHTML += renderTicketCard(t);
            });
        } else { 
            resBox.innerHTML = `<div class='loader-box'>${dict[currentLang].none}</div>`; 
        }
    } catch (e) {
        resBox.innerHTML = `<div class='loader-box' style='color:red'>${dict[currentLang].error}</div>`;
    }
}

// 4. Шаблон карточки билета
function renderTicketCard(t) {
    return `
        <div class="ticket-item">
            <div class="route-details">
                <div style="text-align:center">
                    <div class="city-name">${t.origin}</div>
                    <div class="airport-code">${dict[currentLang].dep}</div>
                </div>
                <div class="plane-path"><i class="fas fa-plane"></i></div>
                <div style="text-align:center">
                    <div class="city-name">${t.destination}</div>
                    <div class="airport-code">${dict[currentLang].arr}</div>
                </div>
            </div>
            <div class="price-tag">
                <div class="cost">${t.price.toLocaleString()} RUB</div>
                <a href="https://www.aviasales.ru${t.link}" class="buy-now" target="_blank">${dict[currentLang].buy}</a>
            </div>
        </div>`;
        // Функция для быстрой подстановки городов из карточек
function setQuickSearch(from, to) {
    document.getElementById('from').value = from;
    document.getElementById('to').value = to;
    
    // Плавный скролл обратно к поиску
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Подсветим кнопку поиска, чтобы пользователь понял — надо жать
    const btn = document.querySelector('.search-btn');
    btn.style.transform = 'scale(1.1)';
    setTimeout(() => btn.style.transform = 'scale(1)', 300);
}

// Обнови словарь (добавь заголовок для карточек)
dict.tk.popularTitle = "Meşhur ugurlar";
dict.ru.popularTitle = "Популярные направления";

// В функции changeLang добавь обновление этого заголовка
function changeLang(lang) {
    // ... твой старый код функции ...
    document.querySelector('.popular-title').innerText = dict[lang].popularTitle;
}
}