const ratingSelectElement = document.querySelector("#rating");
const yearSelectElement = document.querySelector("#year");
const generateMovieBtnElement = document.querySelector(".btn-main");

generateMovieBtnElement.addEventListener("click", function (e) {
  console.log(e.target);
});

function createRatingSelectOptions() {
  let html;
  for (i = 1; i < 11; i++) {
    html += `<option value="${i}">${i}</option>`;
  }
  return html;
}

function createYearSelectOptions() {
  let now = new Date();
  let html;
  for (i = 1950; i < now.getFullYear() + 1; i++) {
    html += `<option value="${i}">${i}</option>`;
  }
  return html;
}

let htmlForRating = createRatingSelectOptions();
ratingSelectElement.innerHTML = htmlForRating;

let htmlForYear = createYearSelectOptions();
yearSelectElement.innerHTML = htmlForYear;
