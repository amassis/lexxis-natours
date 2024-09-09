/* eslint-disable */
import { loginSignup, logout } from './loginSignup';
import { readUserForm, clearPasswordFields } from './readUserForm';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { createReview } from './createReview';

// DOM Elements
const mapboxElement = document.getElementById('map');
const loginFormElement = document.getElementById('login-form');
const logoutBtnElement = document.querySelector('.nav__el--logout');
const saveSettingsBtnElement = document.getElementById('savesettings');
const savePasswordBtnElement = document.getElementById('savepassword');
const resetpasswordBtnElement = document.getElementById('resetpassword');
const bookTourBtnElement = document.getElementById('book-tour');
const reviewTourBtnElement = document.getElementById('review-tour');
const reviewModalElement = document.getElementById('review-modal');
const reviewModalReviewElement = document.getElementById('review-modal-review');
const reviewModalRatingElement = document.getElementById('review-modal-rating');
// const reviewModalCloseBtnElement = document.getElementById(
//   'review-modal--cancel',
// );
const reviewModalSubmitBtnElement = document.getElementById(
  'review-modal--submit',
);

// If page has a map Element, display Map
if (mapboxElement) {
  const locations = JSON.parse(mapboxElement.dataset.locations);
  const startLocation = JSON.parse(mapboxElement.dataset.startLocation);
  displayMap(locations, startLocation);
}

// If page has a login Form, add listener to submit
if (loginFormElement) {
  loginFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = readUserForm('signup/password');
    loginSignup(data);
  });
}

// If page has a logout Button, add listener to click
if (logoutBtnElement) logoutBtnElement.addEventListener('click', logout);

// If page has a Save Settings Button, add listener to click
if (saveSettingsBtnElement) {
  saveSettingsBtnElement.addEventListener('click', (e) => {
    e.preventDefault();
    const data = readUserForm('settings/photo');

    updateSettings(data, 'settings');
  });
}

// If page has a Save Password Button, add listener to click
if (savePasswordBtnElement) {
  savePasswordBtnElement.addEventListener('click', async (e) => {
    e.preventDefault();
    savePasswordBtnElement.textContent = 'Saving ...';
    const data = readUserForm('signup/password');

    await updateSettings(data, 'password');
    savePasswordBtnElement.textContent = 'Save password';
    clearPasswordFields();
  });
}

// If page has a Reset Password Button, add listener to click
if (resetpasswordBtnElement) {
  resetpasswordBtnElement.addEventListener('click', async (e) => {
    e.preventDefault();
    resetpasswordBtnElement.textContent = 'Reset password ...';
    const data = readUserForm('signup/password');

    await updateSettings(data, 'reset');
    savePasswordBtnElement.textContent = 'Save password';
    clearPasswordFields();
  });
}

// If page has a Book Tour Button, add listener to click
if (bookTourBtnElement) {
  bookTourBtnElement.addEventListener('click', async (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing ...';
    const { tourId } = e.target.dataset;

    await bookTour(tourId);
  });
}

// If page has a Review Tour Button, add listener to click
if (reviewTourBtnElement) {
  reviewTourBtnElement.addEventListener('click', async (e) => {
    e.preventDefault();
    const { tourId } = e.target.dataset;
    console.log('Tour RVW');
    console.log(tourId);
    reviewModalElement.dataset.tour = tourId;
    reviewModalElement.style.display = 'block';
  });

  // reviewModalCloseBtnElement.addEventListener('click', () => {
  //   reviewModalElement.style.display = 'none';
  //   location.reload();
  // });

  // reviewModalReviewElement.addEventListener('change', function () {
  //   if (this.value.length >= 20) {
  //     reviewModalSubmitBtnElement.classList.remove('btn--white');
  //     reviewModalSubmitBtnElement.classList.add('btn--green');
  //     reviewModalSubmitBtnElement.removeAttribute('disabled');
  //   }
  // });

  reviewModalSubmitBtnElement.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log(e.target);
    const tourId = reviewModalElement.dataset.tour;
    if (reviewModalReviewElement.value.length > 0)
      createReview({
        tour: tourId,
        rating: reviewModalRatingElement.value,
        review: reviewModalReviewElement.value,
      });
    reviewModalElement.style.display = 'none';
  });

  reviewModalRatingElement.addEventListener('click', function (e) {
    this.style.setProperty('--value', `${this.valueAsNumber}`);
  });

  window.onclick = (event) => {
    if (event.target === reviewModalElement) {
      reviewModalElement.style.display = 'none';
    }
  };
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
