// catchAsync is a function wrapper. Since the async function will return a promise, we can then link a "catch" after we call it using this wrapper
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
