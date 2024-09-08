const AppError = require('../utils/appError');

const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Login expired. Please login again.', 401);

const handleValidationErrorDB = (err) => new AppError(err.message, 400);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let combo = '';

  //If there are more keys/values in the error object, the index is a combination of attributes
  if (Object.keys(err.keyValue).length > 1) combo = ' combination';

  const message = `[${Object.values(err.keyValue).join(', ')}] is not a unique ${Object.keys(err.keyValue).join('+')}${combo}.`;

  return new AppError(message, 400);
};

const sendError = (err, req, res, errorInfoType = '') => {
  //By default send Status, message and status only
  const errorObject = {
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
  };

  //Full error information - send everything
  if (errorInfoType === 'full') {
    errorObject.error = err;
    errorObject.stack = err.stack;
  }

  //Production, unknow errors, send 500 and log to console
  if (errorInfoType === 'prod' && !err.isOperational) {
    console.error('ERROR 🧨', err.name, err.message);
    errorObject.statusCode = 500;
    errorObject.status = 'error';
    errorObject.message = 'Something went wrong, you should seek help!';
  }

  //Send Response
  if (req.originalUrl.startsWith('/api')) {
    //API
    return res.status(errorObject.statusCode).json(errorObject);
  }

  //WEBSITE
  return res.status(errorObject.statusCode).render('error', {
    title: 'Something went wrong ...',
    msg: errorObject.message,
  });
};

// ERROR HANDLING MIDDLWARE
module.exports = (err, req, res, next) => {
  let error = {};
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'TokenExpiredError') {
    console.error('TokenExpiredError');
    error = handleJWTExpiredError(err);
  }
  // JsonWebTokenError occurs with an invalid JWT
  if (err.name === 'JsonWebTokenError') {
    console.error('JsonWebTokenError');
    error = handleJWTError(err);
  }
  //CastError occurs when user sends an attribute with an Invalid format. We use to catch Invalid IDs
  if (err.name === 'CastError') {
    console.error('CastError');
    error = handleCastErrorDB(err);
  }

  //ValidationError occurs when Model validation returns an error
  if (err.name === 'ValidationError') {
    console.error('ValidationError');
    error = handleValidationErrorDB(err);
  }

  //Code 11000 occurs when we send a duplicate of an attribute that is Unique
  if (err.code === 11000) {
    console.error('DuplicateError');
    error = handleDuplicateFieldsDB(err);
  }

  //If none of the previous errors occurred, error is empty object, so use err instead
  if (isObjectEmpty(error)) {
    error = err;
  }

  if (process.env.NODE_ENV === 'development')
    sendError(error, req, res, 'full');
  else if (process.env.NODE_ENV === 'production')
    sendError(error, req, res, 'prod');
  else sendError(error, res);
};
