const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "d9c4bdee4c8f52786f18a224b4948527";

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return ` <div class="details">
                 <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed}M/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else {
        return `<li class="card">
                    <h4>(${weatherItem.dt_txt.split(" ")[0]})</h4>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h5>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h5>
                    <h5>Wind: ${weatherItem.wind.speed}M/s</h5>
                    <h5>Humidity: ${weatherItem.main.humidity}%</h5>
                </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {



        // filtering to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDayForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //clearing previous data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        console.log(fiveDayForecast);
        fiveDayForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));

            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An Error occuered while fetching the forecast.");
    });
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); //removing extra spaces from user given city
    if (!cityName) return; //is city empty

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length)
            return alert(`No coordinates found for ${cityName}.`);

        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An Error occuered while fetching the details.");
    });
}

const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position =>{
            const { latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const {name} =data[0];
                getWeatherDetails(name, latitude, longitude);
                console.log(data);
            }).catch(() => {
                alert("An Error occuered while fetching the city.");
            });
        },
        error =>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again");
            }
        }
    );
}
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());