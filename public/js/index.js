/* eslint-disable */
import { loginSignup, logout } from './loginSignup';
import { readUserForm, clearPasswordFields } from './readUserForm';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { createReview, updateReview } from './createReview';

// DOM Elements
const mapboxElement = document.getElementById('map');
const loginFormElement = document.getElementById('login-form');
const logoutBtnElement = document.querySelector('.nav__el--logout');
const saveSettingsBtnElement = document.getElementById('savesettings');
const savePasswordBtnElement = document.getElementById('savepassword');
const resetpasswordBtnElement = document.getElementById('resetpassword');
const bookTourBtnElement = document.getElementById('book-tour');
const reviewTourBtnElement = document.getElementById('review-tour');
const reviewTourBtnAllElement = document.querySelectorAll('.btn-tiny');
let reviewModalElement = document.getElementById('review-modal');
let reviewModalReviewElement = document.getElementById('review-modal-review');
let reviewModalRatingElement = document.getElementById('review-modal-rating');
let reviewModalSubmitBtnElement = document.getElementById(
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

// If page has a Review Tour Button, add corresponding listeners
if (reviewTourBtnElement) {
  reviewTourBtnElement.addEventListener('click', async (e) => {
    e.preventDefault();
    const { tourId } = e.target.dataset;
    // console.log('Tour RVW');
    // console.log(tourId);
    reviewModalElement.dataset.tour = tourId;
    reviewModalElement.style.display = 'block';
  });

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
    console.log(event.target);
    if (event.target === reviewModalElement) {
      reviewModalElement.style.display = 'none';
    }
  };
}

// If page has multiple Review Tour Buttons, this is "myReviews"
if (reviewTourBtnAllElement.length > 0) {
  // Get all reviewTourBtn Elements
  reviewTourBtnAllElement.forEach((editReviewBtnElement) => {
    // Load tourId and reviewId for each Button element
    const { tourId, reviewId } = editReviewBtnElement.dataset;

    // get DOM for each modal
    reviewModalSubmitBtnElement = document.getElementById(
      `review-modal--submit-${reviewId}`,
    );
    // get DOM for each Review TextArea
    reviewModalReviewElement = document.getElementById(
      `review-modal-review-${reviewId}`,
    );
    // get DOM for each Review Rating
    reviewModalRatingElement = document.getElementById(
      `review-modal-rating-${reviewId}`,
    );

    // Listen for edit Review button
    editReviewBtnElement.addEventListener('click', async (e) => {
      e.preventDefault();

      // Load tourId and reviewId for the clicked edit Button element
      const { tourId, reviewId, ratingValue } = editReviewBtnElement.dataset;

      // get DOM for the corresponding modal Review Rating
      reviewModalElement = document.getElementById(`review-modal-${reviewId}`);

      // get DOM for the corresponding modal Review Rating
      reviewModalRatingElement = document.getElementById(
        `review-modal-rating-${reviewId}`,
      );
      // set tourId in the corresponding Modal Element DOM
      reviewModalElement.dataset.tour = tourId;
      // Show stars in the corresponding modal
      reviewModalRatingElement.style.setProperty('--value', ratingValue);
      // show corresponding Modal
      reviewModalElement.style.display = 'block';
    });

    // Listen for Review Modal Submit Button
    reviewModalSubmitBtnElement.addEventListener('click', (e) => {
      e.preventDefault();

      // Load tourId and reviewId for clicked Submit Button
      const { tourId, reviewId } = e.target.dataset;

      // get DOM for the current modal Review Rating
      reviewModalElement = document.getElementById(`review-modal-${reviewId}`);

      // get DOM for the current Review TextArea
      reviewModalReviewElement = document.getElementById(
        `review-modal-review-${reviewId}`,
      );
      // get DOM for the current Review Rating
      reviewModalRatingElement = document.getElementById(
        `review-modal-rating-${reviewId}`,
      );

      // Update the review that was editted in the Modal
      updateReview({
        id: reviewId,
        tour: tourId,
        rating: reviewModalRatingElement.value,
        review: reviewModalReviewElement.value,
      });

      //Unload current modal
      reviewModalElement.style.display = 'none';
    });

    // Listen for Rating Stars and reset properties to change stars
    reviewModalRatingElement.addEventListener('click', function (e) {
      // send the RatingElement value to the Stars
      this.style.setProperty('--value', `${this.valueAsNumber}`);
    });
  });

  // Listen for clicks outside of the Modal
  window.onclick = (event) => {
    if (event.target === reviewModalElement) {
      //Unload modal
      reviewModalElement.style.display = 'none';
    }
  };
}

// If there is an alert in the Body, call showAlert for it
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
