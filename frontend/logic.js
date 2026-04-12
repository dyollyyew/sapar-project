const API_KEY = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

const langPack = {
    tk: { from: "Nireden", to: "Nirä", date: "Sene", btn: "GÖZLEG", pop: "Meşhur ugurlar", err: "Bilet tapylmady", ph: "Adyňyz" },
    ru: { from: "Откуда", to: "Куда", date: "Дата", btn: "ПОИСК", pop: "Популярные направления", err: "Билеты не найдены", ph: "Ваше имя" }
};

let activeLang = 'tk';
flatpickr("#date", { dateFormat: "Y-m-d", defaultDate: "today" });

function setLanguage(l) {
    activeLang = l;
    document.getElementById('l-tk').className = (l === 'tk' ? 'active' : '');
    document.getElementById('l-ru').className = (l === 'ru' ? 'active' : '');
    document.getElementById('lbl-from').innerText = langPack[l].from;
    document.getElementById('lbl-to').innerText = langPack[l].to;
    document.getElementById('lbl-date').innerText = langPack[l].date;
    document.getElementById('btn-text').innerText = langPack[l].btn;
    document.getElementById('pop-title').innerText = langPack[l].pop;
    document.getElementById('in-name').placeholder = langPack[l].ph;
}

function openProfile() { document.getElementById('pop-up').style.display = 'flex'; }
function saveMe() {
    const n = document.getElementById('in-name').value;
    if(n) {
        localStorage.setItem('sap_user', n);
        document.getElementById('user-name').innerText = n;
        document.getElementById('pop-up').style.display = 'none';
    }
}

async function doSearch() {
    const f = document.getElementById('from').value.trim().toUpperCase();
    const t = document.getElementById('to').value.trim().toUpperCase();
    const d = document.getElementById('date').value;
    const res = document.getElementById('results');

    if(!f || !t || !d) return;

    document.getElementById('popular').style.display = 'none';
    res.innerHTML = "<center style='padding:40px;'>Gözlenilýär...</center>";

    try {
        // Добавлена очистка кеша через метку времени
        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${f}&destination=${t}&departure_at=${d}&currency=rub&token=${API_KEY}`;
        const resp = await fetch(url);
        const resJson = await resp.json();

        if(!resJson.data || resJson.data.length === 0) {
            res.innerHTML = `<center style='padding:40px;'>${langPack[activeLang].err}</center>`;
            return;
        }

        renderResults(resJson.data, f, t);
    } catch (e) {
        res.innerHTML = "<center style='color:red; padding:40px;'>API Error. Check token/internet.</center>";
    }
}

function renderResults(data, f, t) {
    const res = document.getElementById('results');
    res.innerHTML = "";
    
    data.slice(0, 6).forEach((item, index) => {
        let tag = index === 0 ? "Самый дешевый" : (index === 1 ? "Оптимальный" : "");
        let color = index === 0 ? "#008755" : "#007bff";
        
        res.innerHTML += `
            <div class="ticket">
                ${tag ? `<div class="badge" style="background:${color}">${tag}</div>` : ''}
                <div style="flex:1;">
                    <img src="https://pics.avs.io/120/40/${item.airline}.png" style="margin-bottom:10px;">
                    <div style="font-size:18px; font-weight:bold;">${f} ✈ ${t}</div>
                    <div style="color:#888; font-size:13px;">Reýs: ${item.flight_number}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:24px; font-weight:900; margin-bottom:10px;">${item.price.toLocaleString()} ₽</div>
                    <button class="btn-search" onclick="window.open('https://www.aviasales.ru${item.link}&marker=${MARKER}')">SATYN AL</button>
                </div>
            </div>`;
    });
}

function goQuick(fromCode, toCode) {
    document.getElementById('from').value = fromCode;
    document.getElementById('to').value = toCode;
    doSearch();
}

function swapCities() {
    const f = document.getElementById('from'), t = document.getElementById('to');
    [f.value, t.value] = [t.value, f.value];
}

window.onload = () => {
    const saved = localStorage.getItem('sap_user');
    if(saved) document.getElementById('user-name').innerText = saved;
};