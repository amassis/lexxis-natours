class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //Avoid the Constructor call to show up in the Error Stack Trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
