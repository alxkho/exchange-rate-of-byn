"use strict";

const thead = document.querySelector("thead tr"),
  tbody = document.querySelector("tbody"),
  tr = tbody.querySelectorAll("tr"),
  input = document.querySelector("input"),
  datePeriod = document.querySelector(".date"),
  startDate = datePeriod.querySelector(".startDate"),
  endDate = datePeriod.querySelector(".endDate"),
  curID = [431, 451, 456]; // id currencies usd, eur, rub


let endDateValue = (endDate.value = `${toInputDate()}`),
  startDateValue = (startDate.value = `${getDaysPast(6)}`),
  dateLimits = 6, // a week or no limits
  dataR,
  labels;

async function getData() {
  try {

  // endDateValue = (endDate.value = `${toInputDate()}`);
  // startDateValue = (startDate.value = `${getDaysPast(6)}`);
  dataR = {
    431: {},
    451: {},
    456: {},
  };
  labels = [];
    //if we don't need the date limits ↓
  let  dateLimits = Math.abs(new Date(endDateValue).getDate() - new Date(startDateValue).getDate());

  console.log('дата' ,dateLimits);
  console.log('округление', Math.abs(dateLimits));
    for (let i = dateLimits; i >= 0; i--) {
      let date = getDaysPast(i);
      labels.push(date.replace(/-/g, "."));
      for (let j = 0; j < 3; j++) {
        const api = `https://www.nbrb.by/api/exrates/rates/${curID[j]}?ondate=${date}`;
        await fetch(api)
          .then((response) => response.json())
          .then((data) => {
            const curName = data.Cur_Abbreviation,
              rate = data.Cur_OfficialRate;
            dataR[curID[j]].curName = curName;
            dataR[curID[j]].rates === undefined ? dataR[curID[j]].rates = [rate] : dataR[curID[j]].rates.push(rate);
          });
      }
    }
    drawTable(labels, dataR);
    checkRate(); // find min and max values
    myChart();
  } catch (error) {
    alert(error);
  }
}

getData();

input.addEventListener("keyup", search);
// if we have a date limits
// startDate.addEventListener("change", () => {
//   startDateValue = datePeriod.querySelector(".startDate").value;
//   //automatically change another input value ( startDateValue + week )
//   endDateValue = toInputDate(startDateValue, dateLimits, true);
//   datePeriod.querySelector(".endDate").value = endDateValue;
//   getData();
// });
// endDate.addEventListener("change", () => {
//   endDateValue = datePeriod.querySelector(".endDate").value;
//   //automatically change another input value ( endDateValue - week )
//   startDateValue = toInputDate(endDateValue, dateLimits);
//   datePeriod.querySelector(".startDate").value = startDateValue;
//   getData();
// });

// if we don't need the date limits ↓
datePeriod.addEventListener("change", () => {
  startDateValue = datePeriod.querySelector(".startDate").value;
  endDateValue = datePeriod.querySelector(".endDate").value;
  getData();
});

function toInputDate(date = new Date(), days = 0, operator = false) {
  if (!operator) {
    return new Date(new Date(date) - 1000 * 60 * 60 * 24 * days).toISOString().substr(0, 10);
  }
  return new Date(+new Date(date) + 1000 * 60 * 60 * 24 * days).toISOString().substr(0, 10);
}

function getDaysPast(days) {
  return toInputDate(endDateValue, days); //get date in the past
}

function cleanTable(td) {
  if (td) {
    td.forEach((element) => {
      element.parentNode.removeChild(element);
    });
  }
}

function drawTable(date, data) {
  cleanTable(document.querySelectorAll("td"));
  console.log(date);
  date.forEach(dt => thead.innerHTML += `<td>${dt}</td>`)
  Object.keys(data).forEach((el, i) => {
    const curName = data[el].curName,
      tr = tbody.querySelector(`.${curName}`);
    data[el].rates.forEach(rate => {
      tr.innerHTML += `<td>${rate}</td>`;
    })
  });
}

function checkRate() {
  tr.forEach((trItem) => {
    const td = trItem.querySelectorAll("td");
    let maxValue = td[0];
    let minValue = td[0];

    td.forEach((tdItem) => {
      if (tdItem.innerText >= maxValue.innerText) {
        maxValue = tdItem; // find max rate value
      }
      if (tdItem.innerText <= minValue.innerText) {
        minValue = tdItem; // find min rate value
      }
    });
    maxValue.classList.add("maxRate"); // change colors
    minValue.classList.add("minRate");
  });
}

function search() {
  const inputValue = input.value.toUpperCase();
  tr.forEach((trItem) => {
    const thItem = trItem.querySelector("th").innerHTML;
    if (thItem.includes(inputValue)) {
      trItem.hidden = false;
    } else {
      trItem.hidden = true; // hide unnecessary elements
    }
  });
}

function myChart() {
  let ctx = document.getElementById('myChart').getContext('2d');
  let chart = new Chart(ctx, {
    type: 'line',

    data: {
      labels: labels,
      datasets: [{ // График зелёного цвета
          label: 'USD',
          backgroundColor: 'transparent',
          borderColor: 'green',
          data: dataR[curID[0]].rates,
        },
        { // График синего цвета
          label: 'EUR',
          backgroundColor: 'transparent',
          borderColor: 'blue',
          data: dataR[curID[1]].rates
        },
        { // График красного цвета
          label: 'RUB',
          backgroundColor: 'transparent',
          borderColor: 'red',
          data: dataR[curID[2]].rates
        }
      ],
    },

    // Настройки графиков
    options: {}
  });
}