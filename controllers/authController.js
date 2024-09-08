const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

const createSendToken = (statusCode, user, req, res) => {
  const token = signToken(user._id);

  // req.secure doesn't work in heroku, so we need to check headers for x-forwarded-proto === https
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password form output (note: this is not committed to database)
  user.password = undefined;

  const options = {
    status: 'success',
    token,
  };

  if (statusCode === 201)
    options.data = {
      user: user,
    };

  res.status(statusCode).json(options);
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    email: req.body.email,
    password: req.body.password,
    pwdConfirm: req.body.pwdConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(201, newUser, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }
  // 2) Check the user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  // 3) Generate JWT
  createSendToken(200, user, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Check the token is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You need to be logged in to use this feature.', 401),
    );
  }
  //2) Token Verification
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  //3) Check if user still exists
  const user = await User.findById(decodedPayload.id);

  if (!user) {
    return next(new AppError('User does not exist.', 401));
  }
  //4) Check if user changed password after token issued
  if (user.changedPasswordAfter(decodedPayload.iat)) {
    return next(new AppError('Login expired. Please login again.', 401));
  }

  // Grant Access to Route
  req.user = user;
  res.locals.user = user;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action.', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Unknown user.', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    //const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
    const resetURL = `${req.protocol}://${req.get('host')}/passwordReset/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email.' });
  } catch (err) {
    console.error(err);
    user.pwdResetToken = undefined;
    user.pwdResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later.',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    pwdResetToken: hashedToken,
    pwdResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and user is valid, set the new password
  if (!user) {
    return next(new AppError('Invalid or expired token.', 400));
  }

  // 3) Update changedPasswordAt property for the user;
  user.password = req.body.password;
  user.pwdConfirm = req.body.pwdConfirm;
  user.pwdResetExpires = undefined;
  user.pwdResetToken = undefined;
  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(200, user, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user
  const user = await User.findById(req.user.id).select('+password');

  const { pwdCurrent, password, pwdConfirm } = req.body;

  if (!pwdCurrent) {
    return next(new AppError('Please provide your current password.', 400));
  }

  if (!password || !pwdConfirm) {
    return next(
      new AppError('Please provide a new password and confirmation.', 400),
    );
  }

  // 2) Check if posted password is correct
  if (!user || !(await user.correctPassword(pwdCurrent, user.password))) {
    return next(new AppError('Incorrect  password.', 401));
  }

  // 3) Update password
  user.password = req.body.password;
  user.pwdConfirm = req.body.pwdConfirm;
  await user.save();

  // 4) Log user in with new pwd
  createSendToken(200, user, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Only for render pages, no errors here
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //2) Token Verification
      const decodedPayload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      //3) Check if user still exists
      const user = await User.findById(decodedPayload.id);

      if (!user) {
        return next();
      }
      //4) Check if user changed password after token issued
      if (user.changedPasswordAfter(decodedPayload.iat)) {
        return next();
      }

      // User is logged in
      res.locals.user = user;
    }
    return next();
  } catch (err) {
    if (req.cookies.jwt !== 'loggedout') console.error(err);
    // Unlikely - this is some other error, so, show error message in console. Malformed cookie is already to be expected with 'loggedout' so, ignore it.
    return next();
  }
};
