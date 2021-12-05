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
  dateLimits = 6; // a week or no limits

async function getData() {
  try {
    cleanTable(document.querySelectorAll("td"));
    //if we don't need the date limits ↓
    // dateLimits = new Date(endDateValue).getDate() - new Date(startDateValue).getDate();

    for (let i = dateLimits; i >= 0; i--) {
      let date = getDaysPast(i);
      thead.innerHTML += `<td>${date.replace(/-/g, "/")}</td>`; // create date header

      //take the currency one by one
      for (let j = 0; j < 3; j++) {
        const api = `https://www.nbrb.by/api/exrates/rates/${curID[j]}?ondate=${date}`;
        await fetch(api)
          .then((response) => response.json())
          .then((data) => {
            const curName = data.Cur_Abbreviation,
              rate = data.Cur_OfficialRate,
              tr = tbody.querySelector(`.${curName}`);

            tr.innerHTML += `<td>${rate}</td>`; // create the cell with rate
          });
      }
    }
    checkRate(); // find min and max values
  } catch (error) {
    alert(error);
  }
}

getData();
input.addEventListener("keyup", search);
// if we have a date limits
startDate.addEventListener("change", () => {
  startDateValue = datePeriod.querySelector(".startDate").value;
  //automatically change another input value ( startDateValue + week )
  endDateValue = toInputDate(startDateValue, dateLimits, true);
  datePeriod.querySelector(".endDate").value = endDateValue;
  getData();
});
endDate.addEventListener("change", () => {
  endDateValue = datePeriod.querySelector(".endDate").value;
  //automatically change another input value ( endDateValue - week )
  startDateValue = toInputDate(endDateValue, dateLimits);
  datePeriod.querySelector(".startDate").value = startDateValue;
  getData();
});

// if we don't need the date limits ↓// 
// datePeriod.addEventListener("change", () => {
//   startDateValue = datePeriod.querySelector(".startDate").value;
//   endDateValue = datePeriod.querySelector(".endDate").value;
//   getData();
// });

function toInputDate(date = new Date(), days = 0, operator = false) {
  if (!operator) {
    return new Date(new Date(date) - 1000 * 60 * 60 * 24 * days)
      .toISOString()
      .substr(0, 10);
  }
  return new Date(+new Date(date) + 1000 * 60 * 60 * 24 * days)
    .toISOString()
    .substr(0, 10);
}

function getDaysPast(days) {
  const newDate = toInputDate(endDateValue, days); //get date in the past
  return newDate;
}

function cleanTable(td) {
  if (td) {
    td.forEach((element) => {
      element.parentNode.removeChild(element);
    });
  }
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
