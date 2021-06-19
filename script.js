"use strict";

const thead = document.querySelector("thead tr"),
      tbody = document.querySelector("tbody"),
      tr = tbody.querySelectorAll("tr"),
      input = document.querySelector("input"),
      curID = [145, 292, 298]; // id currencies usd, eur, rub


(async function getData() {
  try {
    for (let i = 6; i >= 0; i--) { 

      let date = getDaysPast(i); // get a week
      thead.innerHTML += `<td>${date}</td>`; // create date header

      for (let j = 0; j < 3; j++) { //take the currency one by one
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
})();

input.addEventListener("keyup", search);

function getDaysPast(days) {
  const newDate = new Date(new Date() - 1000 * 60 * 60 * 24 * days); //get date in the past
  return `${newDate.getFullYear()}/${
    newDate.getMonth() + 1
  }/${newDate.getDate()}`; // return date format yy/mm/dd
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
