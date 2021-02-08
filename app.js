const ratingSelectElement = document.querySelector("#rating");
const yearSelectElement = document.querySelector("#year");
const genresSelectElement = document.querySelector("#genres");
const generateMovieBtnElement = document.querySelector(".btn-main");
const votesSelectElement = document.querySelector("#votes");
let movieContainer = document.querySelector(".movie-main-container");

let minYearOfMovie = 1984;

let URL = "";

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

function createRatingSelectOptions() {
  let html;
  for (i = 9; i > 0; i--) {
    html += `<option value="${i}">${i}</option>`;
  }
  ratingSelectElement.innerHTML = html;
}

function createYearSelectOptions() {
  let now = new Date();
  let html;
  for (i = now.getFullYear(); i > minYearOfMovie - 1; i--) {
    html += `<option value="${i}">${i}</option>`;
  }
  yearSelectElement.innerHTML = html;
}

function createGenresSelectOptions() {
  let html = "";
  genres.forEach((genre) => {
    html += `<option value="${genre.id}">${genre.name}</option>`;
  });
  genresSelectElement.innerHTML = html;
}

function createVotesSelectElement() {
  let html = "";
  for (i = 100; i < 1202; i += 100) {
    html += `<option value="${i}">${i}</option>`;
  }
  votesSelectElement.innerHTML = html;
}

function init() {
  createRatingSelectOptions();
  createYearSelectOptions();
  createGenresSelectOptions();
  createVotesSelectElement();
}

function makeURL(query) {
  let URL = `https://api.themoviedb.org/3/discover/movie?api_key=4e1ae7b7696237121285525a25ba8e49&language=en-US&vote_average.gte=${query.rating}&vote_count.gte=${query.minimumVotesQuantity}&with_genres=${query.genre}&primary_release_date.gte=${query.year}`;
  return URL;
}

function makeURLDetailsCredits(path) {
  let URL = `https://api.themoviedb.org/3/movie/${path}?api_key=4e1ae7b7696237121285525a25ba8e49`;
  return URL;
}

generateMovieBtnElement.addEventListener("click", function (e) {
  let query = {
    genre: genresSelectElement.value,
    year: yearSelectElement.value + `-01-01`,
    rating: ratingSelectElement.value,
    minimumVotesQuantity: votesSelectElement.value,
  };
  let URL = makeURL(query);
  checkTotalResults(URL, query);
});

async function checkTotalResults(URL, query) {
  try {
    let response = await fetch(URL);
    let data = await response.json();
    let { total_pages: totalPages, total_results: totalResults } = data;
    if (!totalResults) {
      let err =
        "We have not any results, please change your request and try again.";
      handleError(err);
      return;
    }
    if (totalResults) {
      let randomPage = Math.floor(Math.random() * totalPages + 1);
      let maxResultsOnPage =
        randomPage === totalPages ? totalResults - 20 * (randomPage - 1) : 20;
      let randomResultNumber = Math.floor(Math.random() * maxResultsOnPage);
      console.log(randomResultNumber);
      URL += `&page=${randomPage}`;
      randomMovieRequest(URL, randomResultNumber);
    }
  } catch (err) {
    handleError(err);
  }
}

function handleError(err) {
  movieContainer.innerHTML = "";
  let html = `<h1 class ='error'>${err}</h1>`;
  movieContainer.innerHTML = html;
}

async function randomMovieRequest(URL, randomResultNumber) {
  try {
    let response = await fetch(URL);
    let data = await response.json();
    data = data.results[randomResultNumber];
    let id = data.id;

    let movie = await detailsRequest(id);
    let crew = await crewRequest(id);
    movie.actors = crew.actors;
    movie.director = crew.director;

    let trailerKey = await trailerRequest(id);
    movie.trailerKey = trailerKey;
    showRequestResult(movie);
  } catch (err) {
    handleError(err);
  }
}

async function detailsRequest(id) {
  try {
    let path = id;
    let URL = makeURLDetailsCredits(path);
    let response = await fetch(URL);
    let data = await response.json();
    let {
      poster_path: poster,
      overview,
      genre_ids: genresIds,
      original_title: title,
      vote_average: vote,
      vote_count: voteCount,
      release_date: releaseDate,
      runtime: duration,
    } = data;
    let year = releaseDate.slice(0, 4);
    let movie = {
      poster,
      overview,
      id,
      title,
      vote,
      voteCount,
      releaseDate,
      duration,
      year,
    };
    let genres = data.genres.map((genre) => genre.name);
    genres = genres.join(", ");
    movie.genres = genres;
    return movie;
  } catch (err) {
    handleError(err);
  }
}

async function crewRequest(id) {
  try {
    let path = `${id}/credits`;
    let URL = makeURLDetailsCredits(path);
    let response = await fetch(URL);
    let data = await response.json();
    // data.crew(cast)[xx].job ==='Director'
    let actors = data.cast.splice(0, 5);
    actors = actors.map((actor) => actor.name);
    actors = actors.join(", ");
    let director = data.crew.filter((item) => item.job === "Director")[0].name;
    return { actors, director };
  } catch (err) {
    handleError(err);
  }
}

async function trailerRequest(id) {
  let path = `${id}/videos`;
  let URL = makeURLDetailsCredits(path);
  let response = await fetch(URL);
  let data = await response.json();
  let trailerKey = data.results[0].key;
  return trailerKey;
}

function showRequestResult(movie) {
  movieContainer.innerHTML = "";
  let html = `
  <div class="movie-section">
        <div class="img-box">
          <img
            src="https://image.tmdb.org/t/p/w500${movie.poster}"
            alt=""
            class="poster"
            data-id="${movie.id}"
          />
        </div>
        <div class="description-container">
          <div class="title">
            <h2 class="title-header">${movie.title}</h2>
          </div>
          <div class="rating">Rating: <span>${movie.vote}</span></div>
          <div class="votes-quantity">Votes: <span>${movie.voteCount}</span></div>
          <div class="overview">
            Year:
            <span
              >${movie.year}</span
            >
          </div>
          <div class="genres">
            Genres: <span>${movie.genres}</span>
          </div>
          <div class="director">Director: <span>${movie.director}</span></div>
          <div class="actors">
            Actors:<span>${movie.actors}</span>
          </div>
          <div class="duration">Duration: <span>${movie.duration} min</span></div>
          <div class="overview">
            Overview:
            <span
              >${movie.overview}</span
            >
          </div>
          
        </div>
      </div>
      <div class="trailer">
        <h2>Trailer</h2>
        <iframe
          src="https://www.youtube.com/embed/${movie.trailerKey}"
          frameborder="0"
        ></iframe>
      </div>
  `;
  movieContainer.insertAdjacentHTML("afterbegin", html);
}

init();
