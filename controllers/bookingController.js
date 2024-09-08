const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  if (!req.params.tourId)
    return next(
      new AppError('Tour Id is required for a Checkout Session.', 400),
    );

  const tour = await Tour.findById(req.params.tourId);

  if (!tour)
    return next(
      new AppError(`There is no tour with id ${req.params.tourId}.`, 400),
    );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tourId=${tour.id}&userId=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingAtCheckout = catchAsync(async (req, res, next) => {
  // TEMPORARY SOLUTION
  const { tourId, userId, price } = req.query;
  if (!tourId || !userId || !price) return next();

  await Booking.create({ tour: tourId, user: userId, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

// Middleware for the "Me" Routes.
exports.setMyId = (req, res, next) => {
  req.params.userId = req.user.id;
  next();
};

exports.setUserIdQuery = (req, res, next) => {
  const filter = {};
  if (req.params.userId) {
    filter.user = req.params.userId;
  }
  // console.log(req.query);
  req.query = { ...req.query, ...filter };
  // console.log(req.query);
  next();
};

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
