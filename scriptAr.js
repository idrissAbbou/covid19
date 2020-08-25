class CovidStatus {
    constructor() {
        this.contries = null;
        this.timeLine = null;
        this.countiesCode = null;
        this.arr = null;
    }

    async loadCountriesCodes() {
        const api = await fetch('https://restcountries.eu/rest/v2/all', {
            method: 'GET'
        });
        const json = await api.json();
        this.countiesCode = json;
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

    async loadCountryTimeLine(code) {
        const api = await fetch(
            "https://api.thevirustracker.com/free-api?countryTimeline=" + code, {
                method: "GET",
            }
        );
        const response = await api.json();
        this.timeLine = response.timelineitems[0];
        return response.timelineitems[0];
    }

    findCountryData(countryName) {
        countryName = countryName.charAt(0).toUpperCase() + countryName.slice(1);
        const country = this.contries.filter((c) => c.country == countryName);
        return country[0];
    }
}

const covidStatus = new CovidStatus();

//after page loead
//load the data
//show morocco status
(async () => {
    await covidStatus.loadData();
    const cn = covidStatus.findCountryData(countryName.value);
    displayData(cn);
    await covidStatus.loadCountriesCodes();
    const code = covidStatus.countiesCode.filter(n => n.name == countryName.value)[0].alpha2Code;
    displayTimeLineTable(await covidStatus.loadCountryTimeLine(code));
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

btn.addEventListener("click", async function () {
    const cn =
        countryName.value.charAt(0).toUpperCase() + countryName.value.slice(1);
    const countryData = covidStatus.findCountryData(cn);
    displayData(countryData);

    //find country code
    const code = covidStatus.countiesCode.filter(n => n.name == cn)[0].alpha2Code;
    const data = await covidStatus.loadCountryTimeLine(code);
    displayTimeLineTable(data);
    drawChart();

});

//click btn to show the table of data
document.querySelector(".show_table").addEventListener("click", function (e) {
    // const table = document.querySelector(".dataTable");
    // table.classList.toggle('hidden');
    // table.classList.toggle('show');

});

function displayData(countryData) {
    const countryName = document.querySelector(".country-name");
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

function displayTimeLineTable(jsonData) {
    //get the table from the dom
    const timelineTable = document.querySelector(".dataTable");

    //delete all data from the table
    while (timelineTable.hasChildNodes() && timelineTable.children.length > 1) {
        timelineTable.removeChild(timelineTable.lastChild);
    }



    //insert data into the table
    for (let date in jsonData) {
        if (!jsonData.hasOwnProperty(date) || date == "stat") continue;

        const tr = document.createElement("tr");
        const tdDate = document.createElement("td");
        const tdcases = document.createElement("td");
        const tddeath = document.createElement("td");
        const tdtotalCases = document.createElement("td");
        const tdtotalRecov = document.createElement("td");
        const tdtotalDeaths = document.createElement("td");
        tdDate.innerText = date;
        tdcases.innerText = jsonData[date].new_daily_cases;
        tddeath.innerText = jsonData[date].new_daily_deaths;
        tdtotalCases.innerText = jsonData[date].total_cases;
        tdtotalRecov.innerText = jsonData[date].total_recoveries;
        tdtotalDeaths.innerText = jsonData[date].total_deaths;
        tr.appendChild(tdDate);
        tr.appendChild(tdcases);
        tr.appendChild(tddeath);
        tr.appendChild(tdtotalCases);
        tr.appendChild(tdtotalRecov);
        tr.appendChild(tdtotalDeaths);
        timelineTable.appendChild(tr);
    }
}

//google chart
google.charts.load("current", {
    packages: ["corechart"]
});

google.charts.setOnLoadCallback(drawChart);


async function pushTimeLineDataIntoTheGraphArray() {
    const arr = [];
    await covidStatus.loadCountriesCodes();
    const cn =
        countryName.value.charAt(0).toUpperCase() + countryName.value.slice(1);
    const code = covidStatus.countiesCode.filter(n => n.name == cn)[0].alpha2Code;
    const timeLine = await covidStatus.loadCountryTimeLine(code);
    arr.push(["date", "total cases", "total deaths"]);
    for (let key in timeLine) {
        const cases = timeLine[key].total_cases;
        const deaths = timeLine[key].total_deaths;
        const val = [key, cases, deaths];
        arr.push(val);
    }
    return arr;
}

async function drawChart() {
    const arr = await pushTimeLineDataIntoTheGraphArray();;


    var data = google.visualization.arrayToDataTable(arr);

    var options = {
        title: "العدد الاجمالي للحالات و الوفايات",
        legend: {
            position: "right"
        },
        colors: ["black", "red"],
    };

    var chart = new google.visualization.LineChart(
        document.getElementById("curve_chart_arab")
    );

    chart.draw(data, options);
}