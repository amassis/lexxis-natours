const path = require('path'); // mitigates the possibility of having 2 slashes or no slash at the end of an URL
const express = require('express');
const morgan = require('morgan'); // http request logger
const rateLimit = require('express-rate-limit'); // security - limit repeated requests to public APIs and/or endpoints
const helmet = require('helmet'); // security - sets HTTP response headers
const crypto = require('crypto'); // criptography
const mongoSanitize = require('express-mongo-sanitize'); // security - prevent MongoDB Operator Injection
const xss = require('xss-clean'); // security - against cross site scripting; DEPRECATED - use helmet instead
const hpp = require('hpp'); // stability - http parameter polution (repeated parameters are returned as arrays, breaking up code)
const cookieParser = require('cookie-parser'); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names
const compression = require('compression'); // Compresses all texts sent to client
const cors = require('cors'); // Cross Origin Resource Sharing - allow SPI calls from other domains
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const authRouter = require('./routes/authRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
// tells app to trust proxies (Heroku works as proxy)
if (process.env.NODE_ENV === 'production') app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middleware
// Implement CORS
app.use(cors());
//Access-Control-Allow-Origin: *

//allow non-simple requests (PUT, PATCH, DELETE, Cookies, Nonstandard headers => need preflight phase)
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Security Headers
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(32).toString('hex');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
        styleSrc: ["'self'", 'https:', 'http:', 'unsafe-inline'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: {
      policy: 'origin-when-cross-origin',
    },
  }),
);
// 'worker-src': [
//   "'self'",
//   'https://fonts.googleapis.com',
//   'https://api.mapbox.com',
// ],
// 'script-src': [
//   "'self'",
//   'https://fonts.googleapis.com',
//   'https://api.mapbox.com',
// ],
// 'style-src': [
//   "'self'",
//   'https://fonts.googleapis.com',
//   'https://api.mapbox.com',
// ],
// 'img-src': [
//   "'self'",
//   'data:',
//   'https://tile.openstreetmap.org',
//   'https://tile.openstreetmap.bzh',
//   'https://tiles.stadiamaps.com',
// ],

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
// Prevent brute-force for guessing passwords
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again in 1 hour.',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// PRevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  }),
);

app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/auth', authRouter);

//All other routes are 404
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
