class CovidStatus {
  constructor() {
    this.contries = null;
  }

  async loadData() {
    const api = await fetch("https://covid-193.p.rapidapi.com/statistics", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "covid-193.p.rapidapi.com",
        "x-rapidapi-key": "9939a3ea19mshe78600b401118b2p1ba8b0jsn8d325eb8cf5b",
      },
    });

    const json = await api.json();
    this.contries = json.response;
  }

  findCountryData(countryName) {
    const country = this.contries.filter((c) => c.country == countryName);
    return country[0];
  }
}

const covidStatus = new CovidStatus();

(async () => {
  await covidStatus.loadData();
})();

//get dom elements
const btn = document.getElementById("search");
const countryName = document.getElementById("country-name");
const total = document.querySelector(".total");
const active = document.querySelector(".active");
const newCases = document.querySelector(".new");
const critical = document.querySelector(".critical");
const totalDeath = document.querySelector(".total-death");
const newDeath = document.querySelector(".new-death");
const totalTests = document.querySelector(".total-tests");
const population = document.querySelector(".population");
const lastUpdate = document.querySelector(".last-update");

btn.addEventListener("click", function () {
  const cn =
    countryName.value.charAt(0).toUpperCase() + countryName.value.slice(1);
  const countryData = covidStatus.findCountryData("Morocco");
  displayData(countryData);
});

function displayData(countryData) {
  const countryName = document.querySelector(".country-name");
  console.log(countryData);
  countryName.innerHTML = countryData.country;
  total.innerHTML = countryData.cases.total;
  active.innerHTML = countryData.cases.active;
  newCases.innerHTML = countryData.cases.new;
  critical.innerHTML = countryData.cases.critical;
  totalDeath.innerHTML = countryData.deaths.total;
  newDeath.innerHTML = countryData.deaths.new;
  totalTests.innerHTML = countryData.tests.total;
  population.innerHTML = countryData.population;
  lastUpdate.innerHTML = countryData.day;
}
