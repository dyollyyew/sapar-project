const API_KEY = "23a9b11bc2672f0692432adc75cfc003";
const MARKER = "716446";

async function doSearch() {
    // 1. Принудительно переводим в верхний регистр (KZN, ASB)
    const f = document.getElementById('from').value.trim().toUpperCase();
    const t = document.getElementById('to').value.trim().toUpperCase();
    const d = document.getElementById('date').value;
    const res = document.getElementById('results');

    if(!f || !t || !d) {
        alert("Ähli meýdançalary dolduryň!"); // Твоя ошибка из image_6982e6
        return;
    }

    res.innerHTML = "<center style='padding:40px;'>Gözlenilýär...</center>";

    try {
        // 2. Добавляем прокси (cors-anywhere), если браузер блокирует прямой запрос
        // Попробуй сначала без прокси (чистый URL), если не выйдет - добавь приставку
        const baseUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${f}&destination=${t}&departure_at=${d}&currency=rub&token=${API_KEY}`;
        
        const resp = await fetch(baseUrl);
        
        if (!resp.ok) throw new Error('Network response was not ok');
        
        const resJson = await resp.json();

        if(!resJson.data || resJson.data.length === 0) {
            res.innerHTML = "<center style='padding:40px;'>Bilet tapylmady (Билеты не найдены).</center>";
            return;
        }

        renderResults(resJson.data, f, t);
    } catch (e) {
        console.error(e);
        res.innerHTML = "<center style='color:red; padding:40px;'>API Error. Barlap görüň: <br> 1. Token dogrymy? <br> 2. Internet barmy?</center>";
    }
}

function renderResults(data, f, t) {
    const res = document.getElementById('results');
    res.innerHTML = "";
    
    // Сортируем как на твоем скриншоте image_736961 (Оптимальный, Дешевый)
    data.slice(0, 5).forEach((item, index) => {
        let tag = "";
        let color = "";
        if (index === 0) { tag = "Самый дешевый"; color = "#008755"; }
        if (index === 1) { tag = "Оптимальный"; color = "#007bff"; }

        res.innerHTML += `
            <div class="ticket" style="border: 1px solid #eee; padding: 20px; border-radius: 15px; margin-bottom: 10px; background: #fff; position: relative;">
                ${tag ? `<span style="background:${color}; color:white; padding:2px 10px; border-radius:10px; font-size:12px; position:absolute; top:-10px; left:20px;">${tag}</span>` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <img src="https://pics.avs.io/100/40/${item.airline}.png">
                        <div style="font-size: 20px; font-weight: bold;">${item.price.toLocaleString()} ₽</div>
                    </div>
                    <div style="text-align: center;">
                        <div>${f} ✈ ${t}</div>
                        <small>Reýs: ${item.flight_number}</small>
                    </div>
                    <button onclick="window.open('https://www.aviasales.ru${item.link}&marker=${MARKER}')" 
                            style="background: #008755; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        SATYN AL
                    </button>
                </div>
            </div>`;
    });
}