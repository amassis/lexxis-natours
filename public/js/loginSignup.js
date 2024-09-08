/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const loginSignup = async (data) => {
  // Login by default
  let operation = 'login';

  // It's a SignUp if there is a pwdConfirm, a firstName and familyName
  if (data.pwdConfirm && data.firstName && data.familyName)
    operation = 'signup';

  const options = {
    method: 'POST',
    url: `http://localhost:3000/api/v1/auth/${operation}`,
    data: data,
  };

  try {
    const res = await axios(options);
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${operation[0].toUpperCase()}${operation.slice(1)} successful`,
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.error(err);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/auth/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out, please try again.');
    console.error(err);
  }
};
