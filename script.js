// ===== HORA EM TEMPO REAL =====

setInterval(()=>{

const agora = new Date();

const dias = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

const dia = dias[agora.getDay()];
const data = agora.getDate();
const mes = meses[agora.getMonth()];

const hora = agora.getHours().toString().padStart(2,"0");
const minuto = agora.getMinutes().toString().padStart(2,"0");

document.getElementById("dataHora").innerText =
`${dia} • ${data} ${mes} • ${hora}:${minuto}`;

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

const map = L.map('map').setView([-9.54, 16.34], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);

let radarLayer;

fetch("https://api.rainviewer.com/public/weather-maps.json")
.then(res=>res.json())
.then(data=>{

const radar=data.radar.past;

let index=radar.length-1;

function mostrarRadar(i){

if(radarLayer){
map.removeLayer(radarLayer);
}

const frame=radar[i];

radarLayer=L.tileLayer(
`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
{opacity:0.7}
);

radarLayer.addTo(map);

document.getElementById("tempoRadar").innerText=
new Date(frame.time*1000).toLocaleTimeString();

}

mostrarRadar(index);

const slider=document.getElementById("radarSlider");

slider.max=radar.length-1;

slider.addEventListener("input",()=>{
mostrarRadar(slider.value);
});

let animar=false;

document.getElementById("playRadar").onclick=()=>{

animar=!animar;

if(animar){

let i=0;

const loop=setInterval(()=>{

if(!animar){
clearInterval(loop);
return;
}

mostrarRadar(i);

slider.value=i;

i++;

if(i>=radar.length){
i=0;
}

},700);

}

};

});

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

const apiKey = "241fc91487eab06c609738e55f29afa4";
const cidade = "Malanje";

fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric&lang=pt`)
.then(res => res.json())
.then(data => {

const diasSemana = ["DOM","SEG","TER","QUA","QUI","SEX","SAB"];
const dias = {};

data.list.forEach(item => {

const dataDia = item.dt_txt.split(" ")[0];

if(!dias[dataDia]){
dias[dataDia] = [];
}

dias[dataDia].push(item);

});

const linhas = document.querySelectorAll(".dia-previsao");

Object.keys(dias).slice(0,6).forEach((dia,i)=>{

const lista = dias[dia];

let max = -100;
let min = 100;
let pop = 0;
let clima = "";

lista.forEach(h => {

if(h.main.temp_max > max) max = h.main.temp_max;
if(h.main.temp_min < min) min = h.main.temp_min;

if(h.pop > pop) pop = h.pop;

clima = h.weather[0].main;

});

const dataObj = new Date(dia);

linhas[i].innerHTML = `
<span class="dia">${diasSemana[dataObj.getDay()]}</span>
<i class="icone wi ${getIcon(clima)}"></i>
<span class="temperatura">
<span class="max">${Math.round(max)}°</span>
<span class="min">${Math.round(min)}°</span>
</span>
<span class="chuva">
<i class="wi wi-raindrop"></i>
<span class="chance">${Math.round(pop*100)}%</span>
</span>
`;

});

});


function getIcon(clima){

if(clima==="Rain") return "wi-rain";
if(clima==="Clouds") return "wi-cloudy";
if(clima==="Clear") return "wi-day-sunny";
if(clima==="Thunderstorm") return "wi-thunderstorm";

return "wi-day-cloudy";

}

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

L.control.layers({
"Mapa": base
},{
"Nuvens": nuvens,
"Chuva": chuva
}).addTo(map);

var legenda = L.control({position:"bottomright"});

legenda.onAdd = function () {

var div = L.DomUtil.create("div","legenda");

div.innerHTML += "<b>Chuva</b><br>";
div.innerHTML += "<i style='background:#87CEFA'></i> Fraca<br>";
div.innerHTML += "<i style='background:#00FF00'></i> Moderada<br>";
div.innerHTML += "<i style='background:#FFD700'></i> Forte<br>";
div.innerHTML += "<i style='background:#FF0000'></i> Muito forte<br>";

return div;

};

legenda.addTo(map);