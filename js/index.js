//' https://api.weatherapi.com/v1/forecast.json?key=6a27cd0b6cbe4aa39f772505242502&q=london&days=7


//& HTML Elemments--------------------
var locationElemnet = document.querySelector(".locationp")
var forecastCards = document.querySelector(".forecast-cards")
var searchBox = document.querySelector("#searchBox")
var cityItems = document.querySelector(".city-items")
var btnClearCities = document.querySelector(".btnClearCities")

// & variables -------------------------
var baseUrl = 'https://api.weatherapi.com/v1/forecast.json'
var apiKey = "6a27cd0b6cbe4aa39f772505242502"
var currentlocation = "cairo"
var daysOfForecast = 7
var timeNow = new Date().toLocaleTimeString("en-us", { hour: "numeric", minute: "numeric" })
var hourNow = new Date().toLocaleTimeString("en-us", { hour: "numeric", hour12: false })
var allCities = []
if (localStorage.getItem("allCities") != null) {
    allCities = JSON.parse(localStorage.getItem("allCities"))
    displayAllCities()
}
//& function ------------------------

async function getWeather() {
    var response = await fetch(`${baseUrl}?key=${apiKey}&q=${currentlocation}&days=${daysOfForecast}`)
    var data = await response.json()
    displayWeather(data)
    getAllCities(data)
}

function displayWeather(data) {
    var forecastdays = data.forecast.forecastday
    var locationDetails = `<span class="city-name">${data.location.name}</span>,${data.location.country}`

    var hourNow = new Date().toLocaleTimeString("en-us", { hour: "numeric", hour12: false })
    var cardsHTML = " ";

    locationElemnet.innerHTML = locationDetails
    //' showing the cards
    for (const [index, day] of forecastdays.entries()) {
        var dateToday = new Date(day.date).toLocaleDateString("en-us", { weekday: "long" })

        cardsHTML += `
    <div class="${index === 0 ? "card active" : "card"}" data-index= ${index} >
        <div class="card-header">
            <div class="day">${dateToday}</div>
            <div class="time">${timeNow}</div>
        </div>
        ${day.hour.map(function (hour) {
            return `
            ${hourNow == hour.time.split(" ")[1].split(":")[0] ? `
            <div class="card-body">
            <img src="https:${hour.condition.icon} "/>
            <div class="degree">${hour.temp_c}°C</div>
            </div>
            <div class="card-data">
                <ul class="left-column">
                <li>Real Feel: <span class="real-feel">${hour.feelslike_c} °C</span></li>
                <li>Wind: <span class="wind"> ${hour.wind_kph} K/h</span></li>
                <li>Pressure: <span class="pressure">${hour.pressure_mb} Mb</span></li>
                <li>Humidity: <span class="humidity">${hour.humidity} %</span></li>
                </ul>
                <ul class="right-column">
                <li>Sunrise: <span class="sunrise">${day.astro.sunrise} </span></li>
                <li>Sunset: <span class="sunset">${day.astro.sunset} </span></li>
                </ul>
            </div>
            
            `: ``}
        
        
        
        `}).join("")}
    </div>
    `
    }
    forecastCards.innerHTML = cardsHTML;

    //' handel the active card
    var allCards = document.querySelectorAll(".card")
    for (const [index, card] of allCards.entries()) {
        card.style.cursor = "pointer"
        card.addEventListener("click", function (e) {
            var activeCard = document.querySelector(".card.active") // the first element
            activeCard.classList.remove("active")
            e.currentTarget.classList.add("active")
            //' to display the chance of rain of selected carday 
            getrainInfo(e.currentTarget.dataset.index, forecastdays)
        })
        //'  once you reload the page this showing 'the Chance of rain info' about the daycard that take "active" as a default
        if (card.classList.contains("active")) {
            getrainInfo(card.getAttribute("data-index"), forecastdays)
        }
    }

}

function getrainInfo(index, days) {
    // console.log(index, days[index].hour);
    var hoursOfDaySelected = days[index].hour
    var rianElements = document.querySelectorAll("[data-clock]") // selected the rain bars
    for (const [index, element] of rianElements.entries()) {
        var clock = element.dataset.clock //' this number will refere to the index of hour Object
        var thePercentage = `${hoursOfDaySelected[clock].chance_of_rain}%`
        element.querySelector(".percentage").innerHTML = thePercentage;
        element.querySelector(".percent").style.height = thePercentage;
        // console.log(element.dataset.clock);
    }
}
//-->  display AllCities----------------------------------------------------

async function getCityImage(locationName) {
    var response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${locationName}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
    var data = await response.json()
    const random = Math.trunc(Math.random() * data.results.length)
    return data.results[random].urls.regular
}
async function getAllCities(data) {
    var locationName = data.location.name
    var locationCountry = data.location.country
    var locationImge = await getCityImage(locationName)
    var cityInfo = {
        name: locationName,
        country: locationCountry,
        image: locationImge
    }
    var exist = allCities.find((currentCity) => currentCity.name == cityInfo.name)
    if (exist == undefined) { //' will play in the case of the new city not found in the array
        allCities.push(cityInfo)
        localStorage.setItem("allCities", JSON.stringify(allCities))
        displayAllCities()
    }

    // console.log(allCities);

}
function displayAllCities() {
    var cityTemp = " ";
    for (const city of allCities) {
        cityTemp += `
            <div class="item">
                <div class="city-image">
                <img src="${city.image}" alt="Image for ${city.name} city" />
                </div>
                <div class="city-name"><span class="city-name">${city.name}</span>, ${city.country}</div>
            </div>
    `
    }
    cityItems.innerHTML = cityTemp
}

//-->-------------------------------------------------------------------------

function successCallBack(callBack) {
    var longitude = callBack.coords.longitude;
    var latitude = callBack.coords.latitude;
    var latAndlong = `${latitude}+${longitude}`  //'48.8567,2.3508
    currentlocation = latAndlong
    getWeather()
}
function errorCallBack(callBack) {
    var codeError = callBack.code;
    var messageError = callBack.message;
    if (codeError == 1) {
        getWeather()
        window.alert('please make us Know Your Location')
    }
    else if (codeError == 2) {
        window.alert('Please Check Your Connection')
    }
    else {
        window.alert(`${codeError, messageError}`)
    }
    getWeather()
}

//& Events---------------

window.addEventListener("load", function () {
    this.navigator.geolocation.getCurrentPosition(successCallBack, errorCallBack)
})
searchBox.addEventListener("blur", function (e) {
    currentlocation = this.value
    getWeather()
})
document.addEventListener("keyup", function (e) {
    if (e.key == "Enter") {
        currentlocation = searchBox.value
        getWeather();
    }
})

btnClearCities.addEventListener("click", function (e) {
    localStorage.removeItem("allCities")
    allCities = []
    displayAllCities()
})
