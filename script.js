// ===== HORA EM TEMPO REAL =====

setInterval(()=>{

document.getElementById("dataHora").innerText =

new Date().toLocaleString("pt-PT");

},1000);

// ===== CONFIG =====

const lat = -9.2555;

const lon = 16.3315;

const channelID = "SEU_CHANNEL_ID";

const readAPI = "SUA_READ_API_KEY";

const openWeatherKey = "241fc91487eab06c609738e55f29afa4";

// ===== THINGSPEAK =====

fetch(`https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPI}&results=24`)

.then(res=>res.json())

.then(data=>{

const feeds = data.feeds;

const ultimo = feeds[feeds.length-1];

const temp = parseFloat(ultimo.field1);

const hum = parseFloat(ultimo.field2);

const press = parseFloat(ultimo.field3);

const chuva = parseFloat(ultimo.field4);

const vento = parseFloat(ultimo.field5);

document.getElementById("temperatura").innerText = temp+"°C";

document.getElementById("humidade").innerText = hum+"%";

document.getElementById("pressao").innerText = press+" hPa";

document.getElementById("chuva").innerText = chuva+" mm";

document.getElementById("vento").innerText = vento+" km/h";

calcularSensacao(temp,hum,vento);

calcularClima(temp,hum,press,chuva);

criarGraficos(feeds);

});

// ===== SENSAÇÃO =====

function calcularSensacao(temp,hum,vento){

let sensacao=temp;

if(temp>=27){

sensacao=temp+(hum/100)*2;

}

else if(temp<=20){

sensacao=temp-(vento/10);

}

document.getElementById("sensacao").innerText=

"Sensação: "+sensacao.toFixed(1)+"°C";

}

// ===== CLASSIFICAÇÃO =====

function calcularClima(temp,hum,press,chuva){

let estado="☀️ Ensolarado";

if(chuva>10){

estado="🌧️ Chuva Forte";

}

else if(chuva>2){

estado="🌦️ Chuva Leve";

}

else if(hum>85 && press<1005){

estado="⛈️ Possível Chuva";

}

else if(hum>80){

estado="☁️ Muito Nublado";

}

else if(hum>60){

estado="⛅ Parcialmente Nublado";

}

else if(hum>40){

estado="☁️ Nublado";

}

document.getElementById("estadoTempo").innerText=estado;

calcularDificuldade(temp,chuva,hum);

}

// ===== DIFICULDADE =====

function calcularDificuldade(temp,chuva,hum){

let conducao="✅ Nenhuma";

let caminhada="👍 Boa";

if(chuva>10){

conducao="⚠️ Difícil";

caminhada="❌ Muito Difícil";

}

else if(temp>35){

caminhada="❌ Difícil (Calor)";

}

else if(hum>85){

caminhada="⚠️ Moderada";

}

document.getElementById("conducao").innerText=conducao;

document.getElementById("caminhada").innerText=caminhada;

}

// ===== GRÁFICOS =====

function criarGraficos(feeds){

const horas=feeds.map(f=>new Date(f.created_at).getHours()+"h");

const temp24=feeds.map(f=>f.field1);

const hum24=feeds.map(f=>f.field2);

const press24=feeds.map(f=>f.field3);

new Chart(document.getElementById("grafTemp"),{

type:"line",

data:{labels:horas,datasets:[{label:"Temperatura",data:temp24}]}

});

new Chart(document.getElementById("grafHum"),{

type:"line",

data:{labels:horas,datasets:[{label:"Humidade",data:hum24}]}

});

new Chart(document.getElementById("grafPress"),{

type:"line",

data:{labels:horas,datasets:[{label:"Pressão",data:press24}]}

});

}

// ===== NASCER / POR DO SOL =====

fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`)

.then(r=>r.json())

.then(d=>{

document.getElementById("nascer").innerText=

new Date(d.results.sunrise).toLocaleTimeString();

document.getElementById("por").innerText=

new Date(d.results.sunset).toLocaleTimeString();

});

// ===== MAPA OPENWEATHER =====

const map=L.map('map').setView([lat,lon],8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

.addTo(map);

L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`)

.addTo(map);

L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`)

.addTo(map);

// ===== ATUALIZAÇÃO 4H =====

setInterval(()=>{

location.reload();

},14400000);

// ===== ANIMAÇÃO AO ROLAR A PÁGINA =====

function revealOnScroll(){

    const reveals = document.querySelectorAll(".reveal");

    reveals.forEach(element => {

        const windowHeight = window.innerHeight;

        const elementTop = element.getBoundingClientRect().top;

        const visiblePoint = 100;

        if(elementTop < windowHeight - visiblePoint){

            element.classList.add("active");

        }

    });

}

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();

// ===== PREVISÃO 7 DIAS OPENWEATHER =====

fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric&lang=pt`)

.then(res=>res.json())

.then(data=>{

const dias = {};

data.list.forEach(item=>{

const dataDia = item.dt_txt.split(" ")[0];

if(!dias[dataDia]){

dias[dataDia] = {

temps: [],

icons: [],

};

}

dias[dataDia].temps.push(item.main.temp);

dias[dataDia].icons.push(item.weather[0].icon);

});

const container = document.getElementById("previsaoSemanal");

container.innerHTML="";

let contador=0;

for(const dia in dias){

if(contador>=7) break;

const max = Math.max(...dias[dia].temps);

const min = Math.min(...dias[dia].temps);

const icone = dias[dia].icons[4] || dias[dia].icons[0];

const nomeDia = new Date(dia).toLocaleDateString("pt-PT",{weekday:"long"});

container.innerHTML += `

<div class="dia-previsao">

<span>${contador==0?"Hoje":nomeDia}</span>

<span>

<img src="https://openweathermap.org/img/wn/${icone}.png">

</span>

<span>${max.toFixed(0)}° / ${min.toFixed(0)}°</span>

</div>

`;

contador++;

}

});

function carregarDica(){

fetch("dicas.json")

.then(res=>res.json())

.then(lista=>{

const hoje = new Date().toDateString();

const estadoAtual =

document.getElementById("estadoTempo").innerText;

if(localStorage.getItem("dataDica") !== hoje){

let filtradas = lista.filter(d =>

d.condicao === estadoAtual

);

if(filtradas.length === 0){

filtradas = lista;

}

const sorteio =

filtradas[Math.floor(Math.random()*filtradas.length)];

localStorage.setItem("dicaHoje", JSON.stringify(sorteio));

localStorage.setItem("dataDica", hoje);

}

const dica = JSON.parse(localStorage.getItem("dicaHoje"));

document.getElementById("dicaTitulo").innerText = dica.titulo;

document.getElementById("dicaTexto").innerText = dica.texto;

});

}

// chamar depois de calcular clima

setTimeout(carregarDica,2000);