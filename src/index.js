import './css/styles.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const DEBOUNCE_DELAY = 300;

const input = document.querySelector('#search-box');
const list = document.querySelector('.country-list');
const info = document.querySelector('.country-info');
input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(evt) {
  const country = evt.target.value.trim();
  console.log(country);
  if (!country) {
    info.innerHTML = '';
    list.innerHTML = '';
    return;
  }

  searchCountry(country)
    .then(data => {
      console.log(data);
      if (data.length >= 2 && data.length < 10) {
        list.innerHTML = createList(data);
        info.innerHTML = '';
      }
      if (data.length >= 10) {
        list.innerHTML = '';
        info.innerHTML = '';
        Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }
      if (data.length === 1) {
        list.innerHTML = '';
        info.innerHTML = createMarkup(data);
      }
    })
    .catch(err => {
      list.innerHTML = '';
      info.innerHTML = '';
      if (err.message === 'Not Found') {
        Notify.failure('Oops, there is no country with that name');
      }
    });
}

function searchCountry(name) {
  const BASE_URL = 'https://restcountries.com/v3.1';
  return fetch(`${BASE_URL}/name/${name}`).then(resp => {
    if (!resp.ok) {
      throw new Error(resp.statusText);
    }
    return resp.json();
  });
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        name: { official },
        capital,
        population,
        flags: { svg },
        languages,
      }) => {
        const languagesMarkup = Object.entries(languages)
          .map(([_, value]) => `${value}`)
          .join(', ');
        return `<div class="container-country"><img class="flag" src="${svg}" alt="${official}">
        <h2>${official}</h2></div>
        <p class="criteria"><span>Capital:</span>${capital}</p>
        <p class="criteria"><span>Population:</span>${population}</p>
        <p class="criteria"><span>Languages:</span>${languagesMarkup}</p>`;
      }
    )
    .join('');
}

function createList(arr) {
  return arr
    .map(
      ({ name: { common }, flags: { svg } }) => `<li class="item">
        <img class="flag" src="${svg}" alt="${common}"></img>
        <p class="search-country">${common}</p>
    </li>`
    )
    .join('');
}
