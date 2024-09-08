const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
//const catchAsync = require('../utils/catchAsync');

// Middleware for My reviews set userId param with current user
exports.setMyId = (req, res, next) => {
  req.params.userId = req.user.id;
  next();
};

// Middleware to fetch tour and user Ids when needed in Query
exports.setTourUserIdsQuery = (req, res, next) => {
  const filter = {};
  if (req.params.tourId) {
    filter.tour = req.params.tourId;
  }
  if (req.params.userId) {
    filter.user = req.params.userId;
  }
  // console.log(req.query);
  req.query = { ...req.query, ...filter };
  // console.log(req.query);
  next();
};

// Middleware to fetch tour and user Ids when needed in Body
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review, {
  filterArray: ['user', 'tour', 'createdAt', 'id'],
});
