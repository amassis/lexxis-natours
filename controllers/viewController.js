const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review, rating, user',
  });

  if (!tour) return next(new AppError('There is no tour with that name', 404));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', { title: 'Sign up to a new account' });
};

exports.getAccountForm = (req, res) => {
  // console.log(res.locals.user);
  res.status(200).render('account', { title: 'Your account' });
};

exports.passwordReset = (req, res, next) => {
  // console.log(req.params.token);
  res.status(200).render('resetPassword', {
    title: 'Reset your Password',
    token: req.params.token,
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  const bookings = await Booking.find({ user: req.user.id });

  if (!bookings || bookings.length < 1)
    return next(new AppError("You don't have any bookings", 404));

  const myToursIds = bookings.map((bk) => bk.tour);
  const myTours = await Tour.find({ _id: { $in: myToursIds } });

  res.status(200).render('overview', {
    title: `My Bookings`,
    tours: myTours,
  });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful and a confirmation was sent to your email. Please notice, it may take a few minutes for your account to reflect the new booking. If that's the case, please check back later.";
  next();
};
