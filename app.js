const app = new Vue({
  el: 'main',
  data: {
    searchResults: [],
    noResults: '',
    library: {}
  },
  methods: {
    openMovie(event) {
      displayMovie(event);
    },
    editLibrary(movie, fromLibrary) {
      if (Object.keys(this.library).includes(movie.imdbID)) {
        Vue.delete(this.library, movie.imdbID);
        if (fromLibrary) {
          closeMovie();
        }
      } else {
        Vue.set(this.library, movie.imdbID, movie?.specificData);
      }

      app.$forceUpdate();

      localStorage.setItem('movie-library', Object.keys(this.library));
    },
    openLibrary() {
      const library = document.querySelector('.library');
      const main = document.querySelector('main');

      library.classList.add('opened');
      main.classList.add('no-scroll');

      main.scrollTo(0, 0);
    },
    closeLibrary() {
      const library = document.querySelector('.library');
      const main = document.querySelector('main');

      library.classList.remove('opened');
      main.classList.remove('no-scroll');
    },
    console(val) {
      console.log(val);
    }
  }
})

const API_KEY = '7e3a17c8';
const searchBar = document.querySelector('input');
const resultsContainer = document.querySelector('.results');

(async () => {
  const rawValue = localStorage.getItem('movie-library');
  if (!rawValue || !rawValue.trim()) {
    return;
  }
  const library = rawValue.split(',');
  for (movie of library) {
    const movieData = await makeRequest('GET', `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie}`);
    Vue.set(app.library, movie, JSON.parse(movieData));
  }
})();

searchBar.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const request = new XMLHttpRequest();
    request.open('GET', `https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchBar.value}`);
    request.send();
    
    request.addEventListener('load', (e) => {
      app.searchResults = JSON.parse(request.responseText).Search;

      loadEachMovie();

      if (!app.searchResults) {
        app.noResults = 'No movie found.';
      } else {
        app.noResults = '';
      }
    });
  }
});

async function loadEachMovie() {
  if (!app.searchResults || app.searchResults.length === 0) return;

  for (result of app.searchResults) {
    const movieData = await makeRequest('GET', `https://www.omdbapi.com/?apikey=${API_KEY}&i=${result.imdbID}`);
    const movie = app.searchResults.find((e => e.imdbID === result.imdbID ));
    Vue.set(movie, 'specificData', JSON.parse(movieData));
  }
}

function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
              resolve(xhr.response);
          } else {
              reject({
                  status: this.status,
                  statusText: xhr.statusText
              });
          }
      };
      xhr.onerror = function () {
          reject({
              status: this.status,
              statusText: xhr.statusText
          });
      };
      xhr.send();
  });
}

function displayMovie(event) {
  if (!event.target.classList.contains('action') && event.target.nodeName !== 'SPAN' && !document.querySelector('.selected-movie')) {
    const background = document.querySelector('.background');
    background.classList.add('background-active');
    event.currentTarget.classList.add('selected-movie');
  }
}

function closeMovie() {
  const background = document.querySelector('.background');
  const selected = document.querySelector('.selected-movie');

  selected?.classList.remove('selected-movie');
  background.classList.remove('background-active');
}

(() => {
  document.querySelector('.background').addEventListener('click', closeMovie);
})();
