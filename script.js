const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const currentCard = document.getElementById("currentCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const conditionEl = document.getElementById("condition");
const forecastBody = document.getElementById("forecastBody");

function describeWeatherCode(code) {
   if(code==0)
    return "Clear sky";
   else if(code<=3 && code>=1)
    return "Partly Cloudy";
   else if(code<=48 && code>=45)
    return "Fog";
   else if(code<=57 && code>=51)
    return "Drizzle";
   else if(code<=67 && code>=61)
    return "Rain";
   else if(code<=77 && code>=71)
    return "Snow";
   else if(code<=82 && code>=80)
    return "Rain showers";
   else if(code<=99 && code>=95)
    return "Thunderstorm";
   else
    return "Unkonown";
}

function setStatus(message, isError = false) {

    statusMsg.textContent = message;

    if (isError) {
        statusMsg.classList.add("error");
    }
    else {
        statusMsg.classList.remove("error");
    }
}

async function geocodeCity(city) {
const url =
`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Geocoding request failed");
}

const data = await res.json();

if (!data.results || data.results.length === 0) {
throw new Error("City not found — try another name.");
}

return data.results[0];
}

async function fetchForecast(lat, lon) {
const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
`&current_weather=true` +
`&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
`&timezone=auto`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Forecast request failed");
}

return res.json();
}


function renderCurrentWeather(place, weatherData) {

    const current = weatherData.current_weather;

    cityNameEl.textContent = `${place.name}, ${place.country}`;

    tempEl.textContent = `${current.temperature} °C`;

    windEl.textContent = `${current.windspeed} km/h`;

    conditionEl.textContent =
        describeWeatherCode(current.weathercode);

    currentCard.classList.remove("hidden");
}

function renderForecastTable(daily) {

    forecastBody.innerHTML = "";

    const numberOfDays = Math.min(5, daily.time.length);

    for (let i = 0; i < numberOfDays; i++) {

        const row = document.createElement("tr");

        const condition =
            describeWeatherCode(daily.weathercode[i]);

        row.innerHTML = `
            <td>${daily.time[i]}</td>
            <td>${condition}</td>
            <td>${daily.temperature_2m_max[i]} °C</td>
            <td>${daily.temperature_2m_min[i]} °C</td>
            <td>${daily.precipitation_sum[i]} mm</td>
        `;

        if (daily.precipitation_sum[i] > 0) {
            row.classList.add("rainy");
        }

        forecastBody.appendChild(row);
    }
}
async function handleSearch() {

    const city = cityInput.value.trim();

    if (city === "") {
        setStatus("Please type a city name.", true);
        return;
    }

    currentCard.classList.add("hidden");

    forecastBody.innerHTML = "";

    setStatus("Loading...");

    try {

        const place = await geocodeCity(city);

        console.log(
            "Coordinates:",
            place.latitude,
            place.longitude
        );

        const weatherData = await fetchForecast(
            place.latitude,
            place.longitude
        );

        renderCurrentWeather(place, weatherData);

        renderForecastTable(weatherData.daily);

        setStatus("");

    }
    catch (error) {
        setStatus(error.message, true);
    }
}
searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        handleSearch();
    }
});