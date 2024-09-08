export const getFormElements = () => {
  // returns DOM Elements for the current page (either Account or Signup)
  const emailEl = document.getElementById('email');
  const firstNameEl = document.getElementById('firstname');
  const familyNameEl = document.getElementById('familyname');
  const photoEl = document.getElementById('photo');
  const passwordEl = document.getElementById('password');
  const pwdCurrentEl = document.getElementById('password-current');
  const pwdConfirmEl = document.getElementById('password-confirm');
  const tokenEl = document.getElementById('token');

  return {
    emailEl,
    firstNameEl,
    familyNameEl,
    photoEl,
    passwordEl,
    pwdCurrentEl,
    pwdConfirmEl,
    tokenEl,
  };
};

export const readUserFormSettingsPhoto = () => {
  // Only Account data is used here, including photo
  const { emailEl, firstNameEl, familyNameEl, photoEl } = getFormElements();

  // need to use FormData to be able to upload Photo
  const data = new FormData();
  if (emailEl) data.append('email', emailEl.value);
  if (firstNameEl) data.append('firstName', firstNameEl.value);
  if (familyNameEl) data.append('familyName', familyNameEl.value);

  // If there is an uploaded file, append it to the Form data
  if (photoEl.files.length > 0) data.append('photo', photoEl.files[0]);

  return data;
};

export const readUserFormSignupPassword = () => {
  // Only signup data is used here
  const {
    emailEl,
    firstNameEl,
    familyNameEl,
    passwordEl,
    pwdCurrentEl,
    pwdConfirmEl,
    tokenEl,
  } = getFormElements();

  const data = {};
  if (emailEl) data.email = emailEl.value;
  if (firstNameEl) data.firstName = firstNameEl.value;
  if (familyNameEl) data.familyName = familyNameEl.value;
  if (passwordEl) data.password = passwordEl.value;
  if (pwdCurrentEl) data.pwdCurrent = pwdCurrentEl.value;
  if (pwdConfirmEl) data.pwdConfirm = pwdConfirmEl.value;
  if (tokenEl) data.token = tokenEl.value;

  return data;
};

export const readUserForm = (type) => {
  if (type === 'settings/photo') return readUserFormSettingsPhoto();
  if (type === 'signup/password') return readUserFormSignupPassword();
};

export const clearPasswordFields = () => {
  document.getElementById('password').value = '';
  document.getElementById('password-current').value = '';
  document.getElementById('password-confirm').value = '';
};
