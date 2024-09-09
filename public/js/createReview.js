/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createReview = async (data) => {
  const api = `api/v1/tours/${data.tour}/reviews`;
  const message = 'Review created successfully';

  const options = {
    method: 'POST',
    url: `/${api}`,
    data: data,
  };

  try {
    const res = await axios(options);
    if (res.data.status === 'success') {
      showAlert('success', message);
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};
