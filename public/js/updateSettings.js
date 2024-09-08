/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type = 'settings') => {
  let api = 'api/v1/users/me';
  let message = `${type[0].toUpperCase()}${type.slice(1)} saved successfully`;
  if (type === 'password') {
    api = 'api/v1/auth/updateMyPassword';
  }
  if (type === 'reset') {
    api = `api/v1/auth/resetPassword/${data.token}`;
    message = 'Password reset was successful';
  }

  const options = {
    method: 'PATCH',
    url: `/${api}`,
    data: data,
  };

  try {
    const res = await axios(options);
    if (res.data.status === 'success') {
      showAlert('success', message);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};
