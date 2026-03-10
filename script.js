// HORA
setInterval(()=>{
document.getElementById("dataHora").innerText =
new Date().toLocaleString("pt-PT");
},1000);

const lat = -9.2555;
const lon = 16.3315;

const channelID="SEU_CHANNEL_ID";
const readAPI="SUA_READ_API_KEY";

const openWeatherKey="241fc91487eab06c609738e55f29afa4";

fetch(`https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPI}&results=24`)
.then(res=>res.json())
.then(data=>{

const feeds=data.feeds;
const ultimo=feeds[feeds.length-1];

const temp=parseFloat(ultimo.field1);
const hum=parseFloat(ultimo.field2);
const press=parseFloat(ultimo.field3);
const chuva=parseFloat(ultimo.field4);
const vento=parseFloat(ultimo.field5);

document.getElementById("temperatura").innerText=temp+"°C";
document.getElementById("humidade").innerText=hum+"%";
document.getElementById("pressao").innerText=press+" hPa";
document.getElementById("chuva").innerText=chuva+" mm";
document.getElementById("vento").innerText=vento+" km/h";

calcularSensacao(temp,hum,vento);
calcularClima(temp,hum,press,chuva);
criarGraficos(feeds);

});

function calcularSensacao(temp,hum,vento){

let sensacao=temp;

if(temp>=27){
sensacao=temp+(hum/100)*2;
}
else if(temp<10){
sensacao=temp-2;
}

document.getElementById("sensacao").innerText="Sensação "+sensacao.toFixed(1)+"°C";

}

function calcularClima(temp,hum,press,chuva){

let estado="☀️ Ensolarado";

if(chuva>10){
estado="🌧️ Chuva Forte";
}
else if(chuva>2){
estado="🌦️ Chuva Leve";
}
else if(hum>85 && press<1000){
estado="☁️ Muito Nublado";
}
else if(hum>60){
estado="⛅ Parcialmente Nublado";
}
else if(hum>40){
estado="☁️ Nublado";
}

document.getElementById("estadoTempo").innerText=estado;

}

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

fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`)
.then(r=>r.json())
.then(d=>{

document.getElementById("nascer").innerText=
new Date(d.results.sunrise).toLocaleTimeString();

document.getElementById("por").innerText=
new Date(d.results.sunset).toLocaleTimeString();

});

const map=L.map('map').setView([lat,lon],7);

const base=L.tileLayer(
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
).addTo(map);

const nuvens=L.tileLayer(
`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`,
{opacity:0.75}
).addTo(map);

const chuvaLayer=L.tileLayer(
`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`,
{opacity:0.85}
).addTo(map);

L.control.layers(
{"Mapa":base},
{"Nuvens":nuvens,"Chuva":chuvaLayer}
).addTo(map);