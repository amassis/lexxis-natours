/* eslint-disable */
import { loginSignup, logout } from './loginSignup';
import { readUserForm, clearPasswordFields } from './readUserForm';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM Elements
const mapboxElement = document.getElementById('map');
const loginFormElement = document.querySelector('.form');
const logoutBtnElement = document.querySelector('.nav__el--logout');
const saveSettingsBtnElement = document.getElementById('savesettings');
const savePasswordBtnElement = document.getElementById('savepassword');
const resetpasswordBtnElement = document.getElementById('resetpassword');
const bookTourBtnElement = document.getElementById('book-tour');

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

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
